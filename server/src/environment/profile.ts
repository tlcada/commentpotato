// Don't call logger.ts file here because otherwise; development, test and production variable is undefined in logger.ts file.

enum Profile {
    development = "development", test = "test", production = "production",
}

let env = process.env.NODE_ENV;
env = (env) ? env.trim() : env;

const videoMode = process.env.VIDEO_MODE;
const videoModeOn = (videoMode) ? videoMode.trim() === "on" : false;

const development = (env === Profile.development);
const test = (env === Profile.test);
const production = (env === Profile.production);

export { development, test, production, env as Env, videoModeOn };
