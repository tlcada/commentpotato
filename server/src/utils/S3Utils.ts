import * as fs from "fs";
import * as AWS from "aws-sdk";
import * as Stream from "stream";
import * as parse from "csv-parse";
import { PromiseResult } from "aws-sdk/lib/request";
import * as isStream from "is-stream";
import * as joinPath from "path";

import { createLogger } from "../logger/logger";
import { RandomYouTubeVideoResponse } from "../handler/YouTubeTypes";

const csvWriter = require("csv-write-stream");
const CSV = require("csv-string");
const logger = createLogger(module);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

class S3Utils {

    public getReadStream(path: string, bucketName: string): Stream.Readable {
        const s3Object: AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError> = s3.getObject({ Bucket: bucketName, Key: path });
        return s3Object.createReadStream();
    }

    public async isVideoAlreadyPublished(path: string, videoId: string, bucketName: string): Promise<boolean> {
        const s3Object: AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError> = s3.getObject({ Bucket: bucketName, Key: path });

        try {
            const data: PromiseResult<any, any> = await s3Object.promise();
            const content: string = data.Body.toString();
            return content.includes(videoId);
        } catch (err) {
            return false;
        }
    }

    public async getForbiddenValues(path: string, bucketName: string): Promise<string[]> {
        const s3Object: AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError> = s3.getObject({ Bucket: bucketName, Key: path });
        try {
            const data: PromiseResult<any, any> = await s3Object.promise();
            const content: string = data.Body.toString().trim();
            const words: string[] = content.split(/\r?\n/);
            return words.filter((el: string) => el !== null && el !== "");
        } catch (err) {
            logger.error(`Can not read ${path} file. ${err.message}`);
            return [];
        }
    }

    public async savePublishedCsvToS3(folder: string, fileName: string, bucketName: string): Promise<void> {
        const path: string = joinPath.join(folder, fileName);

        const fsReadStream: fs.ReadStream = fs.createReadStream(path);
        const s3Object: AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError> = s3.getObject({ Bucket: bucketName, Key: path });

        try {
            const data: PromiseResult<any, any> = await s3Object.promise();
            const s3CsvRows: any[] = CSV.parse(data.Body.toString());

            fsReadStream
                .pipe(parse({ from: 0, skip_empty_lines: true, trim: true }))
                .on("error", (err: Error) => {
                    logger.error(`Can not read ${path} file. ${err.message}`);
                })
                .on("data", (fsCsvRow: string[]) => {
                    const rowExist: boolean = s3CsvRows.some((s3CsvRow: string[]) => {
                        return s3CsvRow[0] === fsCsvRow[0];
                    });
                    if (!rowExist) {
                        s3CsvRows.push(fsCsvRow);
                    }
                })
                .on("end", () => {
                    const s3Path: string = joinPath.join(folder, `s3_${fileName}`);
                    const writer = csvWriter({ headers: s3CsvRows[0]});
                    writer.pipe(fs.createWriteStream(s3Path));
                    s3CsvRows.shift();
                    s3CsvRows.map((row: string[]) => writer.write(row));
                    writer.end();
                    this.saveFileToBucket(path, fs.createReadStream(s3Path), bucketName);
                    fs.unlink(s3Path, (err: Error) => {
                        if (err) {
                            logger.error(`Can not remove ${s3Path} file. ${err.message}`);
                        }
                    });
                });
        } catch (err) {
            this.saveFileToBucket(path, fsReadStream, bucketName);
        }
    }

    public savePublishedJsonToS3(path: string, jsonObject: RandomYouTubeVideoResponse[], bucketName: string, s3FilePublicAccess: boolean): void {
        this.saveFileToBucket(path, Buffer.from(JSON.stringify(jsonObject)), bucketName, s3FilePublicAccess);
    }

    public saveIgZipFileToS3(path: string, bucketName: string): void {
        const fsReadStream: fs.ReadStream = fs.createReadStream(path);
        this.saveFileToBucket(path, fsReadStream, bucketName);
    }

    public saveYouTubeVideoEpisodeNumber(path: string, bucketName: string): void {
        const fsReadStream: fs.ReadStream = fs.createReadStream(path);
        this.saveFileToBucket(path, fsReadStream, bucketName);
    }

    public async getYouTubeVideoEpisodeNumber(path: string, bucketName: string): Promise<number | null> {
        const s3Object: AWS.Request<AWS.S3.Types.GetObjectOutput, AWS.AWSError> = s3.getObject({ Bucket: bucketName, Key: path });

        try {
            const data: PromiseResult<any, any> = await s3Object.promise();
            return parseInt(data.Body.toString(), 10);
        } catch (err) {
            logger.error(`S3 error. ${err.message}`);
            return null;
        }
    }

    private saveFileToBucket(path: string, body: fs.ReadStream | Buffer, bucketName: string, s3FilePublicAccess: boolean = false): void {
        let params: any;
        if (s3FilePublicAccess) {
            params = { Bucket: bucketName, Key: path, Body: body, ACL: "public-read" };
        } else {
            params = { Bucket: bucketName, Key: path, Body: body };
        }

        s3.upload(params, (err: Error) => {
            if (isStream(body)) {
                body.destroy();
            }

            if (err) {
                logger.error(`S3 error. ${err.message}`);
            } else {
                logger.info(`File: ${path} added to S3 Bucket`);
            }
        });
    }
}

export default S3Utils;
