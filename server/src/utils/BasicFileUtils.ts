import * as write from "write";
import * as fs from "fs";
import * as archiver from "archiver";
import * as joinPath from "path";

import { SnippetUtils } from "./index";
import { RandomYouTubeVideoResponse } from "../handler/YouTubeTypes";
import { createLogger } from "../logger/logger";
import { production } from "../environment/profile";
import S3Utils from "./S3Utils";
import { GeneralAppSettings } from "../config/configTypes";

const logger = createLogger(module);
const s3: S3Utils = new S3Utils();

class BasicFileUtils {

    private readonly folder: string;

    constructor(folder: string) {
        SnippetUtils.createFolderIfNotExist(folder);
        this.folder = folder;
    }

    public async saveInstagramImageDetailsToFile(jsonObject: RandomYouTubeVideoResponse[], fileName: string, videoIsAlreadyPublished: boolean = false): Promise<void> {
        if (jsonObject.length > 0) {
            const path: string = joinPath.join(this.folder, fileName);
            let txtContent: string = "";
            jsonObject.forEach((video: RandomYouTubeVideoResponse, index: number) => {
                txtContent += this.buildInstagramFileContent(video, index, videoIsAlreadyPublished);
            });

            await write(path, txtContent, { overwrite: true });
        } else {
            logger.warn(`Can not save JSON data to the ${fileName} file because jsonObject is empty.`);
        }
    }

    public async zipAndRemove(zipFileName: string, appSettings: GeneralAppSettings, zipFiles: string[]): Promise<void | never> {
        const path: string = joinPath.join(this.folder, zipFileName);

        const output: fs.WriteStream = fs.createWriteStream(path);
        const archive: archiver.Archiver = archiver("zip", {
            zlib: { level: 0 }, // Sets the compression level
        });

        // 'close' event is fired only when a file descriptor is involved
        output.on("close", () => {
            logger.info(`${zipFileName} has been created and the output file descriptor has closed.`);
        });

        // Good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on("warning", (err) => {
            if (err.code === "ENOENT") {
                logger.warn(err.message);
                throw new Error("ENOENT error");
            } else {
                throw new Error(err.message);
            }
        });

        archive.on("error", (err) => {
            throw new Error(err.message);
        });

        archive.pipe(output);
        zipFiles.forEach((el: string) => {
            archive.glob(joinPath.join(this.folder, `*.${el}`));
        });
        // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
        await archive.finalize();

        // Remove all files from the folder
        SnippetUtils.removeAllFilesInFolder(this.folder, ["zip"]);

        // Save .zip file to AWS S3
        if (production && appSettings.aws.s3.enabled) {
            s3.saveIgZipFileToS3(path, appSettings.aws.s3.bucketName);
        }
    }

    private buildInstagramFileContent(video: RandomYouTubeVideoResponse, index: number, videoIsAlreadyPublished: boolean): string {
        const publishedBefore: string = `Video is published before: ${videoIsAlreadyPublished}`;
        const videoName: string = `${index + 1}. ${video.video.channelTitle} - ${publishedBefore}`;
        const videoTitle: string = video.video.title;
        const videoLink: string = `Link to the @${SnippetUtils.replaceSpace(video.video.channelTitle.toLowerCase())} video and best comment: https://www.youtube.com/watch?v=${video.video.videoId}`;
        return `${videoName}\r\n\r\n${videoTitle}\r\n\r\n${videoLink}\r\n\r\n${this.getHashTags(video.hashtags)}\r\n\r\n------------------------\r\n\r\n`;
    }

    private getHashTags(hashtags: string[]): string {
        const finalHashtags: string = hashtags.join(" ");
        // Add extra hashtags
        return finalHashtags + " #followme #funnypictures #humor #sarcasm #youtube #bestcomments #commentpotato #youtubecomments #youtubecomment";
    }
}

export default BasicFileUtils;
