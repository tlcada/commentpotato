import * as Router from "koa-router";
import * as koaJwt from "koa-jwt";
import * as jsonfile from "jsonfile";
import * as jwt from "jsonwebtoken";
import * as Stream from "stream";
import * as joinPath from "path";

import { createLogger } from "../logger/logger";
import config from "../config/config";
import { GeneralAppSettings, InstagramAppSettings, DynamicAppType } from "../config/configTypes";
import { RandomYouTubeVideoResponse } from "../handler/YouTubeTypes";
import S3Utils from "../utils/S3Utils";
import { production } from "../environment/profile";
import AppFactory from "../factory/AppFactory";
import { getAwsOrLocalStream, getFileStream } from "./routerHelper";
import { SnippetUtils } from "../utils";

const RateLimit = require("koa2-ratelimit").RateLimit;
const basicAuth = require("koa-basic-auth");
const logger = createLogger(module);
const s3: S3Utils = new S3Utils();
const appFactory = new AppFactory();

const defaultCredentials: { name: string, pass: string } = { name: process.env.BASIC_AUTH_USERNAME, pass: process.env.BASIC_AUTH_PASSWORD };
const secondaryCredentials: { name: string, pass: string } = { name: process.env.IG_BASIC_AUTH_USERNAME, pass: process.env.IG_BASIC_AUTH_PASSWORD };

const jwtAuth = koaJwt({
    // Should store JWT secret to the database, but it needs more effort, so maybe later.
    secret: process.env.JWT_SECRET,
});

const router: Router = new Router({
    prefix: "/api/v1",
});

router.get(`/csv_history/:appName`, basicAuth(defaultCredentials), (ctx) => {
    const appName: string = ctx.params.appName;

    try {
        const apps: DynamicAppType = config.apps;
        const appSettings: GeneralAppSettings = apps[appName];
        const readStream: Stream.Readable = getAwsOrLocalStream(config.fileFolders.csvFolder, appSettings.csvFile.name, appSettings.aws.s3.enabled, appSettings.aws.s3.bucketName);
        ctx.attachment(appSettings.csvFile.name);
        ctx.status = 200;
        ctx.body = readStream;
    } catch (err) {
        ctx.status = 404;
        ctx.body = `Application name "${appName}" not found`;
        logger.error(err.message);
    }
});

const instagramRouter: string = "ig";
const igRouterLimiter = RateLimit.middleware({ interval: { min: 15 }, max: 15, prefixKey: `get/${instagramRouter}` });
router.get(`/${instagramRouter}`, igRouterLimiter, basicAuth(secondaryCredentials), async (ctx) => {
    const appSettings: InstagramAppSettings = config.apps.instagram;
    const videoId: string | undefined = ctx.query.video;

    try {
        if (videoId) {
            logger.info(`/ig with video id: ${videoId} is triggered`);
            await appFactory.singleInstagramImageHandler(videoId);
            const readStream: Stream.Readable = getAwsOrLocalStream(appSettings.images.single.folder, appSettings.images.single.zipFileName, false, appSettings.aws.s3.bucketName);
            ctx.attachment(appSettings.images.single.zipFileName);
            ctx.status = 200;
            ctx.body = readStream;
        } else {
            const readStream: Stream.Readable = getAwsOrLocalStream(appSettings.images.weekly.folder, appSettings.images.weekly.zipFileName, appSettings.aws.s3.enabled, appSettings.aws.s3.bucketName);
            ctx.attachment(appSettings.images.weekly.zipFileName);
            ctx.status = 200;
            ctx.body = readStream;
        }
    } catch (err) {
        ctx.status = 404;
        ctx.body = `Can not download Instagram data`;
        logger.error(err.message);
    }
});

const youTubeVideoRouter: string = "video";
const youTubeVideoRouterLimiter = RateLimit.middleware({ interval: { min: 60 }, max: 10, prefixKey: `get/${youTubeVideoRouter}` });
router.get(`/${youTubeVideoRouter}`, youTubeVideoRouterLimiter, basicAuth(secondaryCredentials), (ctx) => {
    const episode: number | undefined = ctx.query.episode;
    const videos: string | undefined = ctx.query.videos;

    if (episode) {
        logger.info(`video?episode=${episode} API call is triggered`);
    } else {
        logger.info(`video API call triggered without episode number`);
    }

    const videoIds: string[] | null = videos ? videos.split(",") : null;

    const horizontalQueryValue: string | undefined = ctx.query.horizontal;
    let horizontal: boolean = true;
    if (horizontalQueryValue) {
        if (horizontalQueryValue === "false") {
            horizontal = false;
        }
    }

    appFactory.routerYouTubeVideoHandler(videoIds, horizontal, episode).then((zipFileName: string) => {
        // TODO post the video somewhere
    }).catch((err: Error) => {
        logger.error(err.message);
    }).finally(() => {
        logger.info(`Video creation is ready`);
    });

    ctx.status = 200;
    ctx.body = "Video creation started... This may take a while.";
});

const twitterTweetRouter: string = "twitter/tweet";
const twitterRouterLimiter = RateLimit.middleware({ interval: { min: 60 }, max: 5, prefixKey: `get/${twitterTweetRouter}` });
router.get(`/${twitterTweetRouter}`, twitterRouterLimiter, basicAuth(defaultCredentials), async (ctx) => {
    let success: boolean;
    const videoId: string | undefined = ctx.query.video;
    const hashtags: string | undefined = ctx.query.hashtags;

    if (videoId) {
        success = await appFactory.twitterHandler(videoId, SnippetUtils.hashtagCreator(hashtags));
    } else {
        success = await appFactory.twitterHandler(null, SnippetUtils.hashtagCreator(hashtags));
    }

    if (success) {
        ctx.status = 200;
        ctx.body = "Tweeted!";
    } else {
        ctx.status = 400;
        ctx.body = `Tweet failed!`;
    }
});

router.get(`/logs/:logFileDate`, basicAuth(defaultCredentials), (ctx) => {
    const logFileDate: string = ctx.params.logFileDate;
    const logFile: string = `${logFileDate}.log`;

    try {
        ctx.attachment(logFile);
        ctx.status = 200;
        ctx.body = getFileStream(config.logs.local.dirname, logFile);
    } catch (err) {
        ctx.status = 404;
        ctx.body = `Log file "${logFile}" not found`;
        logger.error(err.message);
    }
});

router.get(`/auth`, basicAuth(defaultCredentials), async (ctx) => {
    try {
        // Payload would normally be a user ID or something that identifies a unique user on your system.
        // For now, we’ll just mock it up with a simple number. You should also add "ext" but then you also
        // need to implement "refresh_token" logic, so no thanks.
        const token: string = await jwt.sign({ subject: 1 }, process.env.JWT_SECRET);
        ctx.body = {
          access_token: token,
        };
    } catch (err) {
        ctx.status = 400;
        ctx.body = `Can not create JWT`;
        logger.error(`Can not create JWT. Error ${err.message}`);
    }
});

router.get(`/webpage_data`, jwtAuth, async (ctx) => {
    const path: string = joinPath.join(config.fileFolders.jsonFolder, config.apps.webpage.jsonFile.name);

    try {
        let existingJsonObject: Stream.Readable | RandomYouTubeVideoResponse[];
        if (production && config.apps.webpage.aws.s3.enabled) {
            existingJsonObject = s3.getReadStream(path, config.apps.webpage.aws.s3.bucketName);
        } else {
            existingJsonObject = await jsonfile.readFile(path);
        }

        ctx.status = 200;
        ctx.body = existingJsonObject;
    } catch (err) {
        ctx.status = 404;
        ctx.body = "Webpage data is not available";
        logger.error(`JSON file: ${config.apps.webpage.jsonFile.name} not exist`);
    }
});

export default router;
