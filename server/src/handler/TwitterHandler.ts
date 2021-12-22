import * as request from "request";
import * as Twitter from "twitter";
import * as twemoji from "twemoji";
import * as twttr from "twitter-text";
import { ParsedTweet } from "twitter-text";
import * as Stream from "stream";
import * as fs from "fs";
import * as joinPath from "path";

import { SnippetUtils } from "../utils";
import { RandomYouTubeVideoResponse, VideoSnippetThumbnailUrl } from "./YouTubeTypes";
import { createLogger } from "../logger/logger";
import config from "../config/config";
import { TwitterAppSettings } from "../config/configTypes";
import CanvasBuilder from "../builder/CanvasBuilder";
import { getFileStream } from "../router/routerHelper";

const logger = createLogger(module);

const client: Twitter = new Twitter({
    consumer_key: process.env.TWITTER_API_KEY,
    consumer_secret: process.env.TWITTER_API_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Create builder here instead of in the method
const canvasBuilder: CanvasBuilder = new CanvasBuilder(config.apps.twitter.tweet.images.folder, true, true);

export interface TweetResponse {
    tweet: string;
    commentIsTruncated: boolean;
    containsRandomEmoji: boolean;
}

class TwitterHandler {

    // If you don't use a image, Twitter will automatically use a video player which is better than image.
    public async postMedia(youtubeVideo: RandomYouTubeVideoResponse, twitterConf: TwitterAppSettings, ownHashTags: string[]): Promise<boolean> {
        const tweetResponse: TweetResponse | null = this.getTweet(youtubeVideo, twitterConf, ownHashTags);

        if (tweetResponse !== null) {
            const tweet: string = tweetResponse.tweet;
            const thumbnailUrls: VideoSnippetThumbnailUrl = youtubeVideo.video.thumbnailUrl;
            const url: string | null = this.getThumbnailUrl(thumbnailUrls);

            if (!twitterConf.tweet.useImageInsteadOfVideoPlayer || (!twitterConf.tweet.images.useCustomThumbnailImage && url === null)) {
                return await this.tweet({ status: tweet });
            }

            if (twitterConf.tweet.images.useCustomThumbnailImage) {
                return new Promise(async (resolve) => {
                    let filename: string;

                    try {
                        filename = await canvasBuilder.buildCanvasImage(youtubeVideo, false);
                    } catch (err) {
                        logger.error(`Can't read Twitter image file content. Error: ${err.message}`);
                        SnippetUtils.removeAllFilesInFolder(twitterConf.tweet.images.folder);
                        return resolve(false);
                    }

                    try {
                        const filePath: string = joinPath.join(twitterConf.tweet.images.folder, filename);
                        const fileStats: fs.Stats = fs.statSync(filePath);
                        const fileSizeInBytes: number = fileStats.size;
                        logger.info(`Canvas ${filename} size is ${fileSizeInBytes} bytes`);
                        const imageBuffer: Stream.Readable = getFileStream(twitterConf.tweet.images.folder, filename);
                        return resolve(this.tweetWithMedia(twitterConf, tweet, imageBuffer));
                    } catch (err) {
                        logger.error(`Can't read Twitter image file content. Error: ${err.message}`);
                        SnippetUtils.removeAllFilesInFolder(twitterConf.tweet.images.folder);
                        return resolve(false);
                    }
                });
            } else {
                return new Promise((resolve) => {
                    request({ url, encoding: null }, (requestErr, requestResponse, imageBuffer) => {
                        if (!requestErr) {
                            return resolve(this.tweetWithMedia(twitterConf, tweet, imageBuffer));
                        } else {
                            logger.error(`Can not download image from url: ${ url }. Error: ${ requestErr.message }`);
                            return resolve(false);
                        }
                    });
                });
            }
        } else {
            logger.error(`Tweet is too long. something went horribly wrong.`);
            return false;
        }
    }

    public getTweet(youtubeVideo: RandomYouTubeVideoResponse, twitterConf: TwitterAppSettings, ownHashTags: string[]): TweetResponse | null {
        const comment: string = SnippetUtils.replaceNewlineWithTwitterLineEnding(youtubeVideo.comment.comment);
        // Keep this in this level or you will get problems with recursion method
        // because random emoji can change in every recursion loop.
        const randomEmoji: string = this.getRandomEmoji(0, 1);
        return this.buildTweet(youtubeVideo, comment, youtubeVideo.video.title, false, randomEmoji, twitterConf, ownHashTags);
    }

    private tweetWithMedia(twitterConf: TwitterAppSettings, tweet: string, imageBuffer: any): Promise<boolean> {
        return new Promise((resolve) => {
            client.post("media/upload", { media: imageBuffer }, (mediaError, media, mediaResponse) => {
                let resolved;

                if (!mediaError) {
                    resolved = resolve(this.tweet({ status: tweet, media_ids: media.media_id_string }));
                } else {
                    logger.error(`Can not POST image to Twitter. Error: ${mediaError.message}`);
                    resolved = resolve(false);
                }

                if (twitterConf.tweet.images.useCustomThumbnailImage) {
                    SnippetUtils.removeAllFilesInFolder(twitterConf.tweet.images.folder);
                    logger.info(`All thumbnail images have been deleted from the folder: ${twitterConf.tweet.images.folder}`);
                }

                return resolved;
            });
        });
    }

    private tweet(status: { status: string, media_ids?: string }): Promise<boolean> {
        return new Promise((resolve) => {
            client.post("statuses/update", status, (error, tweet, response) => {
                if (!error) {
                    logger.info(`Tweet is successfully posted`);
                    return resolve(true);
                } else {
                    logger.error(`Can not POST tweet to Twitter. Error: ${error.message}`);
                    return resolve(false);
                }
            });
        });
    }

    private getThumbnailUrl(thumbnailUrl: VideoSnippetThumbnailUrl): string | null {
        if (thumbnailUrl.maxResolution !== null) {
            return thumbnailUrl.maxResolution;
        } else if (thumbnailUrl.highResolution !== null) {
            return thumbnailUrl.highResolution;
        } else {
            return null;
        }
    }

    private buildTweet(youtubeVideo: RandomYouTubeVideoResponse, comment: string, videoTitle: string, commentIsTruncated: boolean,
                       randomEmoji: string, twitterConf: TwitterAppSettings, ownHashTags: string[], safetyLimiter: number = 0): TweetResponse | null {
        if (safetyLimiter >= config.youtube.maxApiQueryAtTime + 10) {
            logger.error("Twitter safety limiter is triggered. Something went wrong.");
            return null;
        }

        comment = comment.trim();
        videoTitle = videoTitle.trim();

        const tweet: string = this.tweetTemplate(youtubeVideo, comment, videoTitle, randomEmoji, twitterConf, ownHashTags);
        const isValidTweet: ParsedTweet = twttr.parseTweet(tweet);
        const validRange = isValidTweet.validRangeEnd;
        // Can be, for example, 2 characters
        const numberOfRemovedChars: number = (tweet.length - validRange);

        if (isValidTweet.valid) {
            const containsRandomEmoji: boolean = randomEmoji !== "";
            return { tweet, commentIsTruncated, containsRandomEmoji };
        }

        if (!twitterConf.tweet.disableTitle) {
            const titleMaxLength: number = config.apps.twitter.tweet.titleLength;
            if (videoTitle.length > titleMaxLength) {
                // For example, title length can be 16 characters too long
                const titleExceedingLength: number = (videoTitle.length - titleMaxLength);
                let truncatedVideoTitle: string;

                // If we have extra space in the tweet we can slice, for example, 2 characters instead of 16
                if (numberOfRemovedChars < titleExceedingLength) {
                    truncatedVideoTitle = SnippetUtils.removeWordFromEnd(videoTitle, numberOfRemovedChars);
                } else {
                    truncatedVideoTitle = SnippetUtils.removeWordFromEnd(videoTitle, titleExceedingLength);
                }

                return this.buildTweet(youtubeVideo, comment, truncatedVideoTitle, false, randomEmoji, twitterConf, ownHashTags, safetyLimiter + 1);
            }
        }

        const parsedComment: string = SnippetUtils.removeWordFromEnd(comment, numberOfRemovedChars);
        return this.buildTweet(youtubeVideo, parsedComment, videoTitle, true, randomEmoji, twitterConf, ownHashTags, safetyLimiter + 1);
    }

    private tweetTemplate(youtubeVideo: RandomYouTubeVideoResponse, comment: string, videoTitle: string, randomEmoji: string,
                          twitterConf: TwitterAppSettings, ownHashTags: string[]): string {
        const selectedHashtags: string[] = ownHashTags.length > 0 ? ownHashTags : youtubeVideo.hashtags;
        const hashTags: string = this.getHashTags(selectedHashtags);
        const youtubeUrl: string = `youtu.be/${youtubeVideo.video.videoId}`;
        const tweetTitle: string = (randomEmoji.length <= 0) ? videoTitle : `${videoTitle} ${randomEmoji}`;
        const youTubeVideoLink: string = `${youtubeUrl}`;
        const commentedBy: string = `commented by ${youtubeVideo.comment.authorDisplayName}`;

        if (twitterConf.tweet.disableTitle) {
            if (twitterConf.tweet.images.useCustomThumbnailImage) {
                return `${comment}\r\n\r\n${youTubeVideoLink}\r\n${hashTags}`;
            } else {
                return `${comment}\r\n\r\n${youTubeVideoLink} ${commentedBy} ${hashTags}`;
            }
        }

        if (twitterConf.tweet.images.useCustomThumbnailImage) {
            return `${tweetTitle}\r\n\r\n${comment}\r\n\r\n${youTubeVideoLink}\r\n${hashTags}`;
        } else {
            // Do not use spaces, or there is always extra space before a new line
            return `${tweetTitle}\r\n\r\n${comment}\r\n\r\n${youTubeVideoLink} ${commentedBy} ${hashTags}`;
        }
    }

    private getHashTags(hashtags: string[]): string {
        const tweetConfig: { maxNumberOfHashtags: number, hashtagsMaxLength: number, titleLength: number } = config.apps.twitter.tweet;
        const finalHashtags: string[] = [];
        hashtags.forEach((hashtag: string) => {
            const hashtagsSize: string = `${finalHashtags.join(" ")} ${hashtag}`;
            if (hashtagsSize.length < tweetConfig.hashtagsMaxLength && finalHashtags.length < tweetConfig.maxNumberOfHashtags) {
                finalHashtags.push(hashtag);
            }
        });

        return finalHashtags.join(" ").trim();
    }

    // @see http://www.get-emoji.com/
    private getRandomEmoji(min: number, max: number): string {
        const emojiList: string[] = [
            "1F601", "1F604", "1F60E", "1F917", "1F929", "1F60F", "1F643",
            "1F4AA", "1F449", "1F919", "1F91F", "1F64C", "1F525", "1F44D",
            "1F609", "1F9D0", "1F607", "1F649", "1F646-200D-2640-FE0F",
            "1F646-200D-2642-FE0F", "1F499", "1F9E1", "1F596", "1F64F",
        ];

        let icons: string = "";
        const randomInt: number = SnippetUtils.getRandomInt(min, max);

        for (let i: number = 0; i < randomInt; i++) {
            const index: number = SnippetUtils.getRandomArrayIndex(emojiList);
            icons += twemoji.convert.fromCodePoint(emojiList[index]);
        }

        return icons;
    }
}

export default TwitterHandler;
