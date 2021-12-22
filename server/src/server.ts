require("dotenv").config();
import "isomorphic-fetch";

import * as Koa from "koa";
import * as koaLogger from "koa-logger";

import config from "./config/config";
import { development, production, Env } from "./environment/profile";
import router from "./router/router";
import AppFactory from "./factory/AppFactory";
import { printEnvVariables } from "./environment/envVariables";
import { createLogger } from "./logger/logger";

const cors = require("@koa/cors");

const logger = createLogger(module);
const app: Koa = new Koa();

if (development) {
    app.use(koaLogger());
    app.use(cors({
        origin: "*",
        allowMethods: "GET",
    }));
} else {
    app.use(cors({
        origin: "https://www.commentpotato.com",
        allowMethods: "GET",
    }));
}

app
    .use(router.routes())
    .use(router.allowedMethods());

// Start app schedulers
const appFactory = new AppFactory();
appFactory.startTwitterSchedule();
appFactory.startInstagramSchedule();
appFactory.startWebpageSchedule();
appFactory.startYouTubeVideoSchedule();

// Check that application is not running yet. Http tests need this.
if (!module.parent) {
    app.listen(config.port, () => {
        logger.info(`Server started on port: ${ config.port } and NODE_ENV is: ${Env}`);
        if (!production) {
            printEnvVariables();
        }
    });
}

module.exports = app;
