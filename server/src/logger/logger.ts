import * as winston from "winston";
import * as WinstonDailyRotateFile from "winston-daily-rotate-file";
import * as WinstonCloudWatch from "winston-cloudwatch";
import * as path from "path";

import { production, test } from "../environment/profile";
import config from "../config/config";

const format = winston.format.combine(winston.format.timestamp(), winston.format.json());

let level: string = "info";
if (test) {
    level = "warning";
}

const getFileName = (callingModule: any) => {
    const parts: string[] = callingModule.filename.split(path.sep);
    return ".../" + parts[parts.length - 2] + "/" + parts[parts.length - 1];
};

const winstonDailyRotateFile: WinstonDailyRotateFile = new WinstonDailyRotateFile({
    format,
    level,
    filename: config.logs.local.filename,
    datePattern: config.logs.local.datePattern.toUpperCase(),
    dirname: config.logs.local.dirname,
    maxSize: config.logs.local.maxSize,
    maxFiles: config.logs.local.maxFiles,
});

let transports: any[];

if (production) {
    transports = [
        new WinstonCloudWatch({
            level,
            jsonMessage: true,
            logGroupName: config.logs.cloudWatch.logGroupName,
            logStreamName: config.logs.cloudWatch.logStreamName,
            awsRegion: config.logs.cloudWatch.awsRegion,
            awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
            awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
        }),
        winstonDailyRotateFile,
    ];
} else {
    transports = [
        new winston.transports.Console({ format, level }),
        winstonDailyRotateFile,
    ];
}

const createLogger = (callingModule: any) => {
    return winston.createLogger({
        defaultMeta: { path: getFileName(callingModule) },
        transports,
    });
};

export { createLogger };
