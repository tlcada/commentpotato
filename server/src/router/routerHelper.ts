import * as Stream from "stream";
import * as fs from "fs";
import * as joinPath from "path";

import S3Utils from "../utils/S3Utils";
import { production } from "../environment/profile";
import { createLogger } from "../logger/logger";

const logger = createLogger(module);
const s3: S3Utils = new S3Utils();

export const getAwsOrLocalStream = (folder: string, fileName: string, awsS3Enabled: boolean, bucketName: string) => {
    let readStream: Stream.Readable;
    if (production && awsS3Enabled) {
        const s3Path: string = joinPath.join(folder, fileName);
        readStream = s3.getReadStream(s3Path, bucketName);
    } else {
        readStream = getFileStream(folder, fileName);
    }
    return readStream;
};

export const getFileStream = (folder: string, fileName: string): Stream.Readable => {
    const path: string = joinPath.join(folder, fileName);
    const readStream: Stream.Readable = fs.createReadStream(path);

    readStream.on("error", (err) => {
        logger.error(`Can not download ${fileName} file. ${err}`);
    });

    return readStream;
};
