import * as schedule from "node-schedule";
import { format } from "date-fns";
import * as joinPath from "path";

import config from "../config/config";
import { YouTubeException } from "../exceptions";
import YouTubeHandler, { DataSource, RandomYouTubeVideoResponse } from "../handler/YouTubeHandler";
import TwitterHandler from "../handler/TwitterHandler";
import { BasicFileUtils, CsvFileUtils, JsonFileUtils, SnippetUtils } from "../utils";
import { CSVColumns } from "../utils/CsvFileUtilsTypes";
import { createLogger } from "../logger/logger";
import CanvasBuilder from "../builder/CanvasBuilder";
import { production } from "../environment/profile";
import {
    GeneralAppSettings,
    InstagramAppSettings,
    TwitterAppSettings,
    WebpageAppSettings,
    YouTubeVideoSettings,
    YouTubeVideoSongs,
} from "../config/configTypes";
import YouTubeVideoHandler, { VideoShowImageConfig } from "../handler/YouTubeVideoHandler";

const logger = createLogger(module);
const jsonFileUtils: JsonFileUtils = new JsonFileUtils(config.fileFolders.jsonFolder);
const csvFileUtils: CsvFileUtils = new CsvFileUtils(config.fileFolders.csvFolder);
const twitterHandler: TwitterHandler = new TwitterHandler();

const selectedDataSource: DataSource = YouTubeHandler.getDataSourceByEnvVariable();
const youtubeHandler: YouTubeHandler = new YouTubeHandler(selectedDataSource, csvFileUtils);

class AppFactory {

    public startTwitterSchedule(): void {
        const start = () => {
            this.twitterHandler(null, []).finally(() => {
                logger.info("Twitter handler is done");
            });
        };

        if (config.apps.twitter.inUse && production) {
            schedule.scheduleJob(config.apps.twitter.cronSchedule, () => {
                logger.info("Start Twitter handler");
                start();
            });
        } else if (config.startHandlersInDevMode.twitter) {
            start();
        }
    }

    public startInstagramSchedule(): void {
        const start = () => {
            this.instagramHandler().finally(() => {
                logger.info("Instagram handler is done");
            });
        };

        if (config.apps.instagram.inUse && production) {
            schedule.scheduleJob(config.apps.instagram.cronSchedule, () => {
                logger.info("Start Instagram handler");
                start();
            });
        } else if (config.startHandlersInDevMode.instagram) {
            start();
        }
    }

    public startWebpageSchedule(): void {
        const start = () => {
            this.webpageHandler().finally(() => {
                logger.info("Webpage handler is done");
            });
        };

        if (config.apps.webpage.inUse && production) {
            schedule.scheduleJob(config.apps.webpage.cronSchedule, () => {
                logger.info("Start Webpage handler");
                start();
            });
        } else if (config.startHandlersInDevMode.webpage) {
            start();
        }
    }

    public startYouTubeVideoSchedule(): void {
        const youTubeVideoConf: YouTubeVideoSettings = config.apps.youTubeVideo;
        const youTubeVideoHandler: YouTubeVideoHandler = new YouTubeVideoHandler(youTubeVideoConf);

        const start = () => {
            const keepFiles: string[] = ["txt", youTubeVideoConf.videos.format, "png"];
            this.youTubeVideoHandler(null, youTubeVideoConf, youTubeVideoHandler, keepFiles, true).then((episodeNumber: number) => {
                youTubeVideoHandler.postVideo().finally();
            }).catch((publishVideo: boolean) => {
                logger.warn(`Can not post YouTube video because return value was: ${publishVideo}`);
            }).finally(() => {
                logger.info("YouTube video handler is done");
            });
        };

        if (config.apps.youTubeVideo.inUse && production) {
            schedule.scheduleJob(config.apps.youTubeVideo.cronSchedule, () => {
                logger.info("Start YouTube video handler");
                start();
            });
        } else if (config.startHandlersInDevMode.youtubeVideo) {
            start();
        }
    }

    public async singleInstagramImageHandler(videoId: string): Promise<void> {
        const instagramConf: InstagramAppSettings = config.apps.instagram;

        try {
            const youtubeVideo: RandomYouTubeVideoResponse | null = await youtubeHandler.findYouTubeVideoByVideoId(videoId, instagramConf);
            if (instagramConf.csvFile.enabled) {
                const records: CSVColumns = this.buildRecords(youtubeVideo);
                await csvFileUtils.savePublishedVideoDetailsToFile(records, instagramConf);
            }

            const folderName: string = instagramConf.images.single.folder;

            const canvasBuilderLightTheme: CanvasBuilder = new CanvasBuilder(folderName, false);
            const canvasBuilderBlackTheme: CanvasBuilder = new CanvasBuilder(folderName, true);

            await canvasBuilderLightTheme.buildCanvasImage(youtubeVideo);
            await canvasBuilderBlackTheme.buildCanvasImage(youtubeVideo);

            const basicFileUtils: BasicFileUtils = new BasicFileUtils(folderName);
            const videoIsAlreadyPublished: boolean = await csvFileUtils.isVideoAlreadyPublished(videoId, instagramConf);
            await basicFileUtils.saveInstagramImageDetailsToFile([youtubeVideo], instagramConf.images.single.imageDetailsFile, videoIsAlreadyPublished);
            await basicFileUtils.zipAndRemove(instagramConf.images.single.zipFileName, instagramConf, ["txt", "png"]);
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async routerYouTubeVideoHandler(videoIds: string[] | null, horizontal: boolean, episodeNumber?: number): Promise<string | never> {
        const youTubeVideoConf: YouTubeVideoSettings = config.apps.youTubeVideo;
        const youTubeVideoHandler: YouTubeVideoHandler = new YouTubeVideoHandler(youTubeVideoConf);

        try {
            const keepFiles: string[] = ["txt", youTubeVideoConf.videos.format, "png"];
            const episode: number = await this.youTubeVideoHandler(videoIds, youTubeVideoConf, youTubeVideoHandler, keepFiles, horizontal, episodeNumber);
            const basicFileUtils: BasicFileUtils = new BasicFileUtils(youTubeVideoConf.videos.folder);
            const zipFileName: string = youTubeVideoConf.videos.fileName(episode) + ".zip";
            await basicFileUtils.zipAndRemove(zipFileName, youTubeVideoConf, keepFiles);
            return zipFileName;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async twitterHandler(videoId: string | null, ownHashTags: string[]): Promise<boolean> {
        const twitterConf: TwitterAppSettings = config.apps.twitter;
        const youtubeVideo: RandomYouTubeVideoResponse = await this.findRandomYouTubeVideo(twitterConf, videoId, ownHashTags);
        if (youtubeVideo !== null) {
            return await twitterHandler.postMedia(youtubeVideo, twitterConf, ownHashTags);
        }
    }

    private async instagramHandler(): Promise<void> {
        const instagramConf: InstagramAppSettings = config.apps.instagram;
        const maxNumberOfImages: number = instagramConf.images.weekly.maxNumberOfImages;
        const folderName: string = instagramConf.images.weekly.folder;

        const webPageObject: RandomYouTubeVideoResponse[] = await this.loopYoutubeVideos(maxNumberOfImages, instagramConf);
        const canvasBuilderBlackTheme: CanvasBuilder = new CanvasBuilder(folderName, true);

        if (webPageObject.length > 0) {
            for (const youtubeObject of webPageObject) {
                try {
                    await canvasBuilderBlackTheme.buildCanvasImage(youtubeObject);
                } catch (e) {
                    logger.error(`Can not build canvas image. ${e.message}`);
                }
            }

            try {
                const basicFileUtils: BasicFileUtils = new BasicFileUtils(folderName);
                await basicFileUtils.saveInstagramImageDetailsToFile(webPageObject, instagramConf.images.weekly.imageDetailsFile);
                await basicFileUtils.zipAndRemove(instagramConf.images.weekly.zipFileName, instagramConf, ["txt", "png"]);
            } catch (err) {
                logger.error(err.message);
            }
        } else {
            logger.error(`Can not create Instagram images because webPageObject length was: ${webPageObject}`);
        }
    }

    private async webpageHandler(): Promise<void> {
        const webpageConf: WebpageAppSettings = config.apps.webpage;
        const maxJsonObjects: number = webpageConf.jsonFile.maxJsonObjects;
        const webPageObject: RandomYouTubeVideoResponse[] = await this.loopYoutubeVideos(maxJsonObjects, webpageConf);
        if (webPageObject.length > 0) {
            await jsonFileUtils.savePublishedVideoDetailsToFile(webPageObject, webpageConf.jsonFile.name, webpageConf);
        } else {
            logger.error(`Can not create JSON file because webPageObject length was: ${webPageObject}`);
        }
    }

    private async youTubeVideoHandler(videoIds: string[] | null, youTubeVideoConf: YouTubeVideoSettings, youTubeVideoHandler: YouTubeVideoHandler, keepFiles: string[], horizontal: boolean, episodeNumber?: number): Promise<never | number> {
        const webPageObject: RandomYouTubeVideoResponse[] = await this.loopYoutubeVideos(youTubeVideoConf.videos.maxNumberOfImages, youTubeVideoConf, videoIds);

        if (webPageObject.length > 0) {
            const song: YouTubeVideoSongs = youTubeVideoHandler.getSong();

            const canvasBuilderBlackTheme: CanvasBuilder = new CanvasBuilder(youTubeVideoConf.videos.folder, true, true);
            const imagePath: VideoShowImageConfig[] = [];
            const tags: string[] = [];
            let videoDescription: string = await youTubeVideoHandler.getVideoStartText(episodeNumber);
            let videoLinksTime: number = youTubeVideoConf.videos.coverLoopTime;

            for (const youtubeObject of webPageObject) {
                let fileName: string;

                try {
                    if (horizontal) {
                        fileName = await canvasBuilderBlackTheme.buildCanvasImage(youtubeObject, true);
                    } else {
                        await canvasBuilderBlackTheme.buildCanvasImage(youtubeObject, true);
                        fileName = await canvasBuilderBlackTheme.buildCanvasImage(youtubeObject);
                    }
                } catch (e) {
                    logger.error(`Can not build canvas image. ${e.message}`);
                    continue;
                }

                const fullLength: number = youtubeObject.video.title.length + youtubeObject.comment.comment.length + youtubeObject.comment.likeCount.toString().length;

                let loop: number;
                if (fullLength < 75) {
                    loop = 8;
                } else if (fullLength < 95) {
                    loop = 9;
                } else if (fullLength < 115) {
                    loop = 10;
                } else if (fullLength < 130) {
                    loop = 11;
                } else {
                    loop = 12;
                }

                imagePath.push({ path: joinPath.join(youTubeVideoConf.videos.folder, fileName), loop });
                if (youtubeObject.originalTags.length > 0) {
                    tags.push(youtubeObject.originalTags.splice(0, youTubeVideoConf.videos.tagsPerVideo).join(", "));
                }
                videoDescription += youTubeVideoHandler.getVideoMiddleText(youtubeObject, videoLinksTime);
                videoLinksTime += loop;
            }

            videoDescription += youTubeVideoHandler.getVideoEndText(song, tags);
            return await youTubeVideoHandler.buildVideo(imagePath, videoDescription, song, keepFiles, horizontal, episodeNumber);
        } else {
            throw new Error(`Can not build YouTube video because webPageObject length was: ${webPageObject.length}`);
        }
    }

    private async loopYoutubeVideos(numberOfVideos: number, appSettings: GeneralAppSettings, videoIds: string[] | null = null): Promise<RandomYouTubeVideoResponse[]> {
        const webPageObject: RandomYouTubeVideoResponse[] = [];
        let safetyLimiter: number = 0;

        while (webPageObject.length < numberOfVideos) {
            // Avoid infinity loop
            if (safetyLimiter >= (numberOfVideos + config.youtube.maxApiQueryAtTime)) {
                break;
            }

            await SnippetUtils.sleep(500);

            let videoId: string | null = null;
            if (videoIds) {
                if (videoIds[safetyLimiter]) {
                    videoId = videoIds[safetyLimiter];
                }
            }

            const youtubeVideo: RandomYouTubeVideoResponse = await this.findRandomYouTubeVideo(appSettings, videoId, []);
            if (youtubeVideo !== null) {
                webPageObject.push(youtubeVideo);
            }
            safetyLimiter++;
        }

        return webPageObject;
    }

    private async findRandomYouTubeVideo(appSettings: GeneralAppSettings, videoId: string | null, ownHashTags: string[],
                                         recursionCounter: number = 0): Promise<RandomYouTubeVideoResponse> | null {
        let youtubeVideo: RandomYouTubeVideoResponse | null;

        try {
            if (videoId !== null && typeof videoId === "string") {
                youtubeVideo = await youtubeHandler.findYouTubeVideoByVideoId(videoId, appSettings);
            } else {
                youtubeVideo = await youtubeHandler.findRandomYouTubeVideo(appSettings, ownHashTags);
            }

            if (appSettings.csvFile.enabled) {
                const records: CSVColumns = this.buildRecords(youtubeVideo);
                await csvFileUtils.savePublishedVideoDetailsToFile(records, appSettings);
            }
        } catch (err) {
            if (err instanceof YouTubeException) {
                if (recursionCounter >= config.youtube.maxApiQueryAtTime) {
                    logger.error(`YouTube max API query (${config.youtube.maxApiQueryAtTime}) at time has been exceeded`);
                } else {
                    logger.warn(err.message);
                    return await this.findRandomYouTubeVideo(appSettings, videoId, ownHashTags, recursionCounter + 1);
                }
            } else {
                logger.error({ code: err.status, message: err.message });
            }

            youtubeVideo = null;
        }

        logger.info(`Recursion counter number was: ${recursionCounter}`);
        return youtubeVideo;
    }

    private buildRecords(youtubeVideo: RandomYouTubeVideoResponse): CSVColumns {
        return {
            videoId: youtubeVideo.video.videoId,
            publishedAt: youtubeVideo.video.publishedAt,
            title: SnippetUtils.replaceLineBreakWithBr(youtubeVideo.video.title),
            thumbnailMediumResolution: youtubeVideo.video.thumbnailUrl.mediumResolution,
            thumbnailHighResolution: youtubeVideo.video.thumbnailUrl.highResolution,
            thumbnailStandardResolution: youtubeVideo.video.thumbnailUrl.standardResolution,
            thumbnailMaxResolution: youtubeVideo.video.thumbnailUrl.maxResolution,
            channelTitle: youtubeVideo.video.channelTitle,
            channelId: youtubeVideo.video.channelId,
            viewCount: youtubeVideo.video.viewCount,
            videoLikeCount: youtubeVideo.video.likeCount,
            dislikeCount: youtubeVideo.video.dislikeCount,
            commentCount: youtubeVideo.video.commentCount,
            authorDisplayName: youtubeVideo.comment.authorDisplayName,
            authorChannelUrl: youtubeVideo.comment.authorChannelUrl,
            comment: SnippetUtils.replaceLineBreakWithBr(youtubeVideo.comment.comment),
            commentLikeCount: youtubeVideo.comment.likeCount,
            commentPublishedAt: youtubeVideo.comment.publishedAt,
            authorProfileImageUrl: youtubeVideo.comment.authorProfileImageUrl,
            totalReplyCount: youtubeVideo.comment.totalReplyCount,
            hashtags: youtubeVideo.hashtags,
            releaseTime: format(new Date(), config.dateFormat.finnishTime),
            keyword: youtubeVideo.video.keyword,
            originalTags: youtubeVideo.originalTags,
        };
    }
}

export default AppFactory;
