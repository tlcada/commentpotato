import { createLogger } from "../logger/logger";
const logger = createLogger(module);

const envVariables = (): void => {
    logger.info(`BASIC_AUTH_USERNAME: ${process.env.BASIC_AUTH_USERNAME}`);
    logger.info(`BASIC_AUTH_PASSWORD: ${process.env.BASIC_AUTH_PASSWORD}`);
    logger.info(`IG_BASIC_AUTH_USERNAME: ${process.env.IG_BASIC_AUTH_USERNAME}`);
    logger.info(`IG_BASIC_AUTH_PASSWORD: ${process.env.IG_BASIC_AUTH_PASSWORD}`);

    logger.info(`YOUTUBE_API_KEY: ${process.env.YOUTUBE_API_KEY}`);

    logger.info(`LANGUAGE_DETECTION_API_KEY: ${process.env.LANGUAGE_DETECTION_API_KEY}`);

    logger.info(`JWT_SECRET: ${process.env.JWT_SECRET}`);

    logger.info(`TWITTER_API_KEY: ${process.env.TWITTER_API_KEY}`);
    logger.info(`TWITTER_API_SECRET: ${process.env.TWITTER_API_SECRET}`);
    logger.info(`TWITTER_ACCESS_TOKEN: ${process.env.TWITTER_ACCESS_TOKEN}`);
    logger.info(`TWITTER_ACCESS_TOKEN_SECRET: ${process.env.TWITTER_ACCESS_TOKEN_SECRET}`);
};

export { envVariables as printEnvVariables };
