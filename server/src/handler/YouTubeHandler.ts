import { errorResponseFormatter, get, post } from "../api/call";
import config from "../config/config";
import { ForbiddenWords, GeneralAppSettings } from "../config/configTypes";
import { CsvFileUtils, SnippetUtils } from "../utils";
import { YouTubeException } from "../exceptions/";
import {
    SearchResponse,
    SearchResponseItem,
    VideoStatisticsResponse,
    VideoStatistics,
    ParsedVideoDetailsReturn,
    VideoCommentsResponse,
    VideoCommentsItems,
    VideoCommentsSnippet,
    ParsedComment,
    LanguageDetection,
    RandomYouTubeVideoResponse,
    VideoStatisticsCasted,
    ErrorResponse,
    VideoSnippet,
    VideoSnippetResponse,
    VideoSnippetReturn,
    Thumbnails,
} from "./YouTubeTypes";
import { createLogger } from "../logger/logger";
import TwitterHandler, { TweetResponse } from "./TwitterHandler";
import S3Utils from "../utils/S3Utils";
import { production, videoModeOn } from "../environment/profile";

const logger = createLogger(module);
const twitterHandler = new TwitterHandler();
const s3: S3Utils = new S3Utils();

enum DataSource {
    VALID_DUMMY_DATA,
    INVALID_DUMMY_DATA,
    REAL_DATA,
}

const youTubeResponse = (details: ParsedVideoDetailsReturn, statistics: VideoStatisticsCasted, snippets: VideoSnippetReturn, comments: ParsedComment): RandomYouTubeVideoResponse => {
    return {
        video: {
            ...details,
            ...statistics,
            thumbnailUrl: snippets.thumbnailUrl,
            title: snippets.title,
            channelTitle: snippets.channelTitle,
            publishedAt: snippets.publishedAt,
            channelId: snippets.channelId,
            keyword: details.keyword,
        },
        comment: comments,
        hashtags: [
            ...snippets.hashTags,
        ],
        originalTags: [
            ...snippets.originalTags,
        ],
    };
};

class YouTubeHandler {

    public static getDataSourceByEnvVariable(): DataSource {
        if (production || videoModeOn) {
            return DataSource.REAL_DATA;
        }

        return config.devModeDataSource;
    }

    private readonly dataSource: DataSource;
    private readonly csvFileUtils: CsvFileUtils;

    constructor(dataSource: DataSource, csvFileUtils: CsvFileUtils) {
        logger.info(`DataSource: ${dataSource} is used. See: DataSource enum`);
        this.dataSource = dataSource;
        this.csvFileUtils = csvFileUtils;
    }

    // TODO you can create findRandomYouTubeVideoTwitter method, so you don't need to use everywhere ownHashTags variable
    public async findRandomYouTubeVideo(appSettings: GeneralAppSettings, ownHashTags: string[], selectFirstVideoFromList: boolean = false): Promise<RandomYouTubeVideoResponse> | never {
        const videoDetails: ParsedVideoDetailsReturn = await this.getRandomVideoDetails(selectFirstVideoFromList, appSettings);
        const videoStatistics: VideoStatisticsCasted = await this.getVideoStatistics(videoDetails.videoId, appSettings);
        const videoSnippets: VideoSnippetReturn = await this.getVideoSnippets(videoDetails.videoId, appSettings);
        const videoComments: ParsedComment = await this.getVideoComments(videoDetails.videoId, videoSnippets.channelTitle, appSettings);

        const response: RandomYouTubeVideoResponse = youTubeResponse(videoDetails, videoStatistics, videoSnippets, videoComments);
        if (appSettings.name === "twitter" && appSettings.youtube.commentMaxLength === null) {
            const tweetResponse: TweetResponse = twitterHandler.getTweet(response, config.apps.twitter, ownHashTags);
            if (tweetResponse.commentIsTruncated) {
                throw new YouTubeException(`YouTube comment is too long for Twitter. Title is disabled: ${config.apps.twitter.tweet.disableTitle}`);
            }
        }
        return response;
    }

    public async findYouTubeVideoByVideoId(videoId: string, appSettings: GeneralAppSettings): Promise<RandomYouTubeVideoResponse> | never {
        const videoDetails: ParsedVideoDetailsReturn = { videoId, keyword: videoId };
        const videoStatistics: VideoStatisticsCasted = await this.getVideoStatistics(videoDetails.videoId, appSettings);
        const videoSnippets: VideoSnippetReturn = await this.getVideoSnippets(videoDetails.videoId, appSettings);
        const videoComments: ParsedComment = await this.getVideoComments(videoDetails.videoId, videoSnippets.channelTitle, appSettings);
        return youTubeResponse(videoDetails, videoStatistics, videoSnippets, videoComments);
    }

    private async getRandomVideoDetails(selectFirstVideoFromList: boolean, appSettings: GeneralAppSettings): Promise<ParsedVideoDetailsReturn> | never {
        logger.info(`Started getRandomVideoDetails(...) method`);

        const words: string[] = [];

        if (!appSettings.youtube.wordLists) {
            throw new Error("wordLists variable is not defined. Can't continue.");
        }

        appSettings.youtube.wordLists.forEach((fileName: string) => {
            const wordList: string[] = require(`./assets/${fileName}`);
            words.push(...wordList);
        });

        if (words.length <= 0) {
            throw new Error("Word list is empty. Can't continue.");
        }

        const randomWordIndex: number = SnippetUtils.getRandomArrayIndex(words);
        const randomWord: string = words[randomWordIndex];
        logger.info(`Random word index was: ${randomWordIndex} and random word is: ${randomWord}`);

        let searchResponse: SearchResponse;
        if (this.dataSource === DataSource.VALID_DUMMY_DATA || this.dataSource === DataSource.INVALID_DUMMY_DATA) {
            searchResponse = require("../../dummy_data/valid/search_results.json");
        } else {
            const searchQueryParams: any = config.youtube.queryParameters.searchQuery(randomWord, appSettings.youtube.apiKey);
            const searchParams: URLSearchParams = new URLSearchParams(searchQueryParams);
            searchResponse = await get(`${config.youtube.apiUrl}/search?${searchParams.toString()}`);
        }

        // Sometimes totalResults can be bigger than zero but content has been moderated out.
        if (searchResponse.pageInfo.totalResults <= 0 || searchResponse.items.length <= 0) {
            throw new YouTubeException(`No search results were found for query: ${randomWord}`);
        }

        // If you select a random index you can get more variation in the search result.
        const videoIndex: number = (selectFirstVideoFromList) ? 0 : SnippetUtils.getRandomArrayIndex(searchResponse.items);
        const item: SearchResponseItem = searchResponse.items[videoIndex];
        const videoId: string = item.id.videoId;
        logger.info(`Found video id: ${videoId} with videoIndex: ${videoIndex}`);

        const videoIsAlreadyPublished: boolean = await this.csvFileUtils.isVideoAlreadyPublished(videoId, appSettings);
        if (videoIsAlreadyPublished) {
            throw new YouTubeException(`Video has already been published. Video id: ${videoId}`);
        }

        logger.info(`Search for query: ${randomWord} successfully returned video id: ${videoId}`);

        return {
            videoId,
            keyword: randomWord,
        };
    }

    private async getVideoStatistics(videoId: string, appSettings: GeneralAppSettings): Promise<VideoStatisticsCasted> | never {
        logger.info(`Started getVideoStatistics(...) method`);

        let videoStatisticsResponse: VideoStatisticsResponse;
        if (this.dataSource === DataSource.VALID_DUMMY_DATA || this.dataSource === DataSource.INVALID_DUMMY_DATA) {
            videoStatisticsResponse = require("../../dummy_data/valid/video_statistics.json");
        } else {
            const videoQueryParams: any = config.youtube.queryParameters.videoQuery(videoId, appSettings.youtube.apiKey);
            const videoParams: URLSearchParams = new URLSearchParams(videoQueryParams);
            videoStatisticsResponse = await get(`${config.youtube.apiUrl}/videos?${videoParams.toString()}`);
        }

        if (videoStatisticsResponse.pageInfo.totalResults <= 0 || videoStatisticsResponse.items.length <= 0) {
            throw new YouTubeException(`No search results found by video id: ${videoId}`);
        }

        const { likeCount, dislikeCount, viewCount, commentCount }: VideoStatistics = videoStatisticsResponse.items[0].statistics;

        // No need to continue if comments are disabled
        if (commentCount === undefined) {
            throw new YouTubeException(`Comments are disabled by video id (${videoId}`);
        }

        const likeCountNumber: number = parseInt(likeCount, 10);
        const dislikeCountNumber: number = parseInt(dislikeCount, 10);
        const viewCountNumber: number = parseInt(viewCount, 10);
        const commentCountNumber: number = parseInt(commentCount, 10);

        // If the video like count is less than dislike count, then the video content quality is unlikely to be good.
        if (likeCountNumber < dislikeCountNumber) {
            throw new YouTubeException(`Video content quality is not enough for video: ${videoId}`);
        }

        // Does the video have enough views?
        if (viewCountNumber < appSettings.youtube.minVideoViews) {
            throw new YouTubeException(`View count: ${viewCountNumber} has too low for video: ${videoId}. Required view count is: ${appSettings.youtube.minVideoViews}`);
        }

        // Video must have at least one comment
        if (commentCountNumber <= 0) {
            throw new YouTubeException(`No comments found by video id: ${videoId}`);
        }

        logger.info(`Search for video id: ${videoId} successfully returned video statistics`);

        return {
            likeCount: likeCountNumber,
            dislikeCount: dislikeCountNumber,
            viewCount: viewCountNumber,
            commentCount: commentCountNumber,
        };
    }

    private async getVideoSnippets(videoId: string, appSettings: GeneralAppSettings): Promise<VideoSnippetReturn> | never {
        logger.info(`Started getVideoSnippets(...) method`);

        let videoSnippetResponse: VideoSnippetResponse;
        if (this.dataSource === DataSource.VALID_DUMMY_DATA || this.dataSource === DataSource.INVALID_DUMMY_DATA) {
            videoSnippetResponse = require("../../dummy_data/valid/video_snippet.json");
        } else {
            const videoTagsParams: any = config.youtube.queryParameters.videoTags(videoId, appSettings.youtube.apiKey);
            const videoParams: URLSearchParams = new URLSearchParams(videoTagsParams);
            videoSnippetResponse = await get(`${config.youtube.apiUrl}/videos?${videoParams.toString()}`);
        }

        if (videoSnippetResponse.pageInfo.totalResults <= 0 || videoSnippetResponse.items.length <= 0) {
            throw new YouTubeException(`No video snippets were found by video id: ${videoId}`);
        }

        const snippet: VideoSnippet = videoSnippetResponse.items[0].snippet;

        const videoTitle: string = SnippetUtils.removeInvalidCharacters(snippet.title);
        const forbiddenWords: ForbiddenWords = config.youtube.aws.forbiddenWords;
        const containsForbiddenWords: boolean = await this.containsForbiddenValues(videoTitle.toLowerCase(), forbiddenWords.path, forbiddenWords.bucketName);
        if (containsForbiddenWords) {
            throw new YouTubeException(`Video title contains forbidden words. Title is: ${videoTitle}. Video id: ${videoId}`);
        }

        const channelName: string = snippet.channelTitle;
        const forbiddenChannels: ForbiddenWords = config.youtube.aws.forbiddenChannels;
        const containsForbiddenChannels: boolean = await this.containsForbiddenValues(channelName, forbiddenChannels.path, forbiddenChannels.bucketName);
        if (containsForbiddenChannels) {
            throw new YouTubeException(`Video channel name contains forbidden words. Channel name is: ${channelName}. Video id: ${videoId}`);
        }

        const tags: string[] | undefined = snippet.tags;
        if (tags) {
            // Use channel name always in hashtags
            tags.unshift(channelName);
        }

        const hashTags: string[] = SnippetUtils.buildHashTagsByTags(tags, appSettings.youtube.maxNumberOfHashtags);
        // Do not order tags
        const originalTags: string[] = (!tags) ? [] : tags.splice(0, appSettings.youtube.maxNumberOfHashtags);

        const checkUrl = (url: Thumbnails): string | null => {
            return (url === undefined) ? null : url.url;
        };

        return {
            thumbnailUrl: {
                mediumResolution: checkUrl(snippet.thumbnails.medium),
                highResolution: checkUrl(snippet.thumbnails.high),
                standardResolution: checkUrl(snippet.thumbnails.standard),
                maxResolution: checkUrl(snippet.thumbnails.maxres),
            },
            title: videoTitle,
            channelTitle: channelName, // For example muselk
            hashTags,
            originalTags,
            publishedAt: snippet.publishedAt,
            channelId: snippet.channelId,
        };
    }

    private async getVideoComments(videoId: string, channelTitle: string, appSettings: GeneralAppSettings): Promise<ParsedComment> | never {
        logger.info(`Started getVideoComments(...) method`);

        let comments: VideoCommentsResponse;
        if (this.dataSource === DataSource.VALID_DUMMY_DATA) {
            comments = require("../../dummy_data/valid/comments.json");
        } else if (this.dataSource === DataSource.INVALID_DUMMY_DATA) {
            const errorResponse: ErrorResponse = require("../../dummy_data/invalid/comments_disabled.json");
            throw errorResponseFormatter({ status: 403, message: errorResponse.error.message });
        } else {
            const commentsQueryParams: any = config.youtube.queryParameters.commentsQuery(videoId, appSettings.youtube.apiKey);
            const commentsParams: URLSearchParams = new URLSearchParams(commentsQueryParams);
            try {
                comments = await get(`${config.youtube.apiUrl}/commentThreads?${commentsParams.toString()}`);
            } catch (err) {
                // Comments are disabled from the video. Response code is 403 but
                // do not use it because we want to avoid an infinity loop.
                if (err.message.includes("disabled comments")) {
                    throw new YouTubeException(`${err.message} Video id: ${videoId}`);
                }
            }
        }

        logger.info(`API returned: ${comments.items.length} comments`);
        // Get first comment because number of likes does not tell if the comment "the best one" or not.
        const mostLikedComment: VideoCommentsItems = comments.items.find((comment: VideoCommentsItems) => {
            const commentAuthor: string = comment.snippet.topLevelComment.snippet.authorDisplayName;
            // Do not return a comment if it was written by the channel owner
            return commentAuthor !== channelTitle;
        });

        if (mostLikedComment === undefined) {
            throw new YouTubeException(`Seems like that the video has only one comment and was written by the video owner himself. Video id: ${videoId}`);
        }

        const { textOriginal, authorDisplayName, authorChannelUrl, likeCount, publishedAt, authorProfileImageUrl }: VideoCommentsSnippet = mostLikedComment.snippet.topLevelComment.snippet;
        const forbiddenWords: ForbiddenWords = config.youtube.aws.forbiddenWords;
        const containsForbiddenWords: boolean = await this.containsForbiddenValues(textOriginal.toLowerCase(), forbiddenWords.path, forbiddenWords.bucketName);

        if (containsForbiddenWords) {
            throw new YouTubeException(`Comment contains forbidden words. Comment is: ${textOriginal}. Video id: ${videoId}`);
        }

        if (likeCount < appSettings.youtube.minCommentLikeCount) {
            throw new YouTubeException(`Comment must have at least ${appSettings.youtube.minCommentLikeCount} likes but was: ${likeCount}. Video id: ${videoId}`);
        }

        if (appSettings.youtube.commentMaxLength !== null) {
            if (textOriginal.length > appSettings.youtube.commentMaxLength) {
                throw new YouTubeException(`Comment is too long. Comment length was: ${textOriginal.length} but maximum is: ${appSettings.youtube.commentMaxLength}. Video id: ${videoId}`);
            }
        }

        const languageResponse: LanguageDetection = await post(`${config.languageDetection.apiUrl}`, new Headers({
            "Authorization": `Bearer ${process.env.LANGUAGE_DETECTION_API_KEY}`,
            "Content-Type": "application/json",
        }), {
            q: textOriginal,
        });

        if (languageResponse.data.detections.length <= 0) {
            throw new YouTubeException(`Can not confirm comment language because language response is empty. Video id: ${videoId}`);
        }

        if (languageResponse.data.detections[0].language !== config.youtube.commentLanguage || languageResponse.data.detections[0].confidence < 7) {
            throw new YouTubeException(`Top level comment is not written in English or confidence (${languageResponse.data.detections[0].confidence}) is too low. Video id: ${videoId}`);
        }

        logger.info(`Search for video id: ${videoId} successfully returned video comment`);

        return {
            authorDisplayName,
            authorChannelUrl,
            comment: textOriginal,
            likeCount,
            publishedAt,
            authorProfileImageUrl,
            totalReplyCount: mostLikedComment.snippet.totalReplyCount,
        };
    }

    private async containsForbiddenValues(str: string, path: string, bucket: string): Promise<boolean> {
        const forbiddenWords: string[] = await s3.getForbiddenValues(path, bucket);
        return forbiddenWords.some((forbiddenWord: string) => {
            if (str.includes(forbiddenWord)) {
                logger.warn(`Forbidden word is: ${forbiddenWord}`);
                return true;
            }
            return false;
        });
    }
}

export { DataSource, RandomYouTubeVideoResponse };
export default YouTubeHandler;
