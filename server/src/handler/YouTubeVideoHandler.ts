import { format, addSeconds } from "date-fns";
import * as write from "write";
import * as joinPath from "path";

import { SnippetUtils } from "../utils";
import { createLogger } from "../logger/logger";
import { YouTubeVideoSettings, YouTubeVideoSongs } from "../config/configTypes";
import config from "../config/config";
import { RandomYouTubeVideoResponse } from "./YouTubeTypes";
import S3Utils from "../utils/S3Utils";
import { production, videoModeOn } from "../environment/profile";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const videoShow = require("videoshow");
const logger = createLogger(module);
const s3: S3Utils = new S3Utils();

export interface VideoShowImageConfig {
    path: string;
    caption?: string;
    loop?: number;
}

const getVideoOptions = (videoFormat: string, height: number, width: number) => {
  return {
      fps: 25,
      transition: true,
      transitionDuration: config.apps.youTubeVideo.videos.transitionDuration, // seconds
      videoBitrate: 1024,
      videoCodec: "libx264", // not use mpeg4 codec because the quality is lower
      size: `${width}x${height}`,
      audioBitrate: "128k",
      audioChannels: 2,
      format: videoFormat,
  };
};

class YouTubeVideoHandlerHandler {

    private readonly folder: string;
    private readonly youTubeVideoConf: YouTubeVideoSettings;

    constructor(youTubeVideoConf: YouTubeVideoSettings) {
        SnippetUtils.createFolderIfNotExist(youTubeVideoConf.videos.folder);
        this.folder = youTubeVideoConf.videos.folder;
        this.youTubeVideoConf = youTubeVideoConf;
    }

    public async postVideo(): Promise<void> {
        // TODO post to YouTube
    }

    public async buildVideo(imagePath: VideoShowImageConfig[], videoDescription: string, song: YouTubeVideoSongs, keepFiles: string[], horizontal: boolean, episodeNumber: number | undefined): Promise<never | number> {
        return new Promise(async (resolve, reject) => {
            // Keep this on the top
            episodeNumber = await this.getEpisode(episodeNumber);
            if (episodeNumber === null) {
                return reject();
            }

            const videoFormat: string = this.youTubeVideoConf.videos.format;
            const fileName: string = this.youTubeVideoConf.videos.fileName(episodeNumber);
            const savePath: string = joinPath.join(this.folder, fileName);
            // __dirname not work with Docker
            const assetsPath: string = "src/handler";
            let height: number;
            let width: number;

            if (horizontal) {
                height = config.canvas.horizontal.height;
                width = config.canvas.horizontal.width;
                imagePath.unshift({ path: joinPath.join(assetsPath, "assets", "horizontal_cover_img.png"), loop: this.youTubeVideoConf.videos.coverLoopTime });
                imagePath.push({ path: joinPath.join(assetsPath, "assets", "horizontal_back_cover_img.png"), loop: 6 });
            } else {
                height = config.canvas.vertical.height;
                width = config.canvas.vertical.width;
                imagePath.unshift({ path: joinPath.join(assetsPath, "assets", "vertical_cover_img.png"), loop: this.youTubeVideoConf.videos.coverLoopTime });
                imagePath.push({ path: joinPath.join(assetsPath, "assets", "vertical_back_cover_img.png"), loop: 8 });
            }

            videoShow(imagePath, getVideoOptions(videoFormat, height, width))
                .audio(joinPath.join(assetsPath, "assets", song.fileName), { fade: true, delay: 0 })
                .save(`${savePath}.${videoFormat}`)
                .on("start", () => {
                    logger.info(`YouTube video ffmpeg process started`);
                })
                .on("error", (err: Error) => {
                    logger.error("YouTube video ffmpeg process error: ", err);
                    SnippetUtils.removeAllFilesInFolder(this.folder, keepFiles);
                    return reject();
                })
                .on("end", async (output: string) => {
                    logger.info(`YouTube video created in: ${output}`);
                    SnippetUtils.removeAllFilesInFolder(this.folder, keepFiles);
                    await write(`${savePath}.txt`, videoDescription, { overwrite: true });
                    await write(joinPath.join(this.folder, this.youTubeVideoConf.videos.episodeCounterFileName), episodeNumber.toString(), { overwrite: true });
                    if ((videoModeOn && this.youTubeVideoConf.aws.s3.enabled) || (production && this.youTubeVideoConf.aws.s3.enabled)) {
                        await s3.saveYouTubeVideoEpisodeNumber(joinPath.join(this.folder, this.youTubeVideoConf.videos.episodeCounterFileName), this.youTubeVideoConf.aws.s3.bucketName);
                    }
                    return resolve(episodeNumber);
                });
        });
    }

    public async getVideoStartText(episodeNumber: number | undefined): Promise<string> {
        episodeNumber = await this.getEpisode(episodeNumber);
        const videoTitle: string = `Random YouTube videos and their best comment | Episode ${ episodeNumber }`;
        const title: string = `Welcome to the Episode ${ episodeNumber } | Subscribe: https://www.youtube.com/channel/UCXmQk4PYoq5v9jIvmRgfXYg?sub_confirmation=1`;
        const fallowMe: string = `❱ Follow me on:`;
        const ig: string = `Instagram: https://www.instagram.com/commentpotato`;
        const twitter: string = `Twitter: https://twitter.com/commentpotato`;
        const facebook: string = `Facebook: https://www.facebook.com/commentpotato`;
        const website: string = `❱ More random YouTube videos and their best comment: https://www.commentpotato.com`;
        const videoLinks: string = `Link to the YouTube videos:`;
        return `${videoTitle}\r\n\r\n----\r\n\r\n${title}\r\n\r\n${fallowMe}\r\n${ig}\r\n${twitter}\r\n${facebook}\r\n\r\n${website}\r\n\r\n${videoLinks}\r\n\r\n`;
    }

    public getVideoMiddleText(youTubeVideoResponse: RandomYouTubeVideoResponse, seconds: number): string {
        const helperDate: Date = addSeconds(new Date(0), seconds);
        const time: string = format(helperDate, "mm:ss");
        const link: string = `${youTubeVideoResponse.video.title}: https://youtu.be/${youTubeVideoResponse.video.videoId}`;
        return `${time} ${link}\r\n`;
    }

    public getVideoEndText(song: YouTubeVideoSongs, tags: string[]): string {
        const title: string = `Music for this video:`;
        const name: string = `${song.name}`;
        const link: string = `Link: ${song.link}`;
        const license: string = `License: ${song.license}`;
        return `\r\n${title}\r\n\r\n${name}\r\n${link}\r\n${license}\r\n\r\n----\r\n\r\n${tags.join(", ")}\r\n`;
    }

    public getSong(index: number = null): YouTubeVideoSongs {
        const songs: YouTubeVideoSongs[] = this.youTubeVideoConf.videos.songs;
        const songIndex: number = index === null ? SnippetUtils.getRandomArrayIndex(songs) : index;
        return songs[songIndex];
    }

    private async getEpisode(episode: number | undefined): Promise<number | null> {
        if (!episode) {
            if (!this.youTubeVideoConf.aws.s3.enabled) {
                logger.error(`The YouTube episode number cannot be found because the episode is not manually added and S3 is disabled.`);
                return null;
            }

            const response: number = await s3.getYouTubeVideoEpisodeNumber(joinPath.join(this.folder, this.youTubeVideoConf.videos.episodeCounterFileName), this.youTubeVideoConf.aws.s3.bucketName);
            return (response === null) ? null : (response + 1);
        } else {
            return episode;
        }
    }
}

export default YouTubeVideoHandlerHandler;
