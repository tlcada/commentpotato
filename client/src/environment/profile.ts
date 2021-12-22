enum Profile {
    development = "development", test = "test", production = "production",
}

let env: any = process.env.NODE_ENV;
env = (env) ? env.trim() : env;

const development = (env === Profile.development);
const test = (env === Profile.test);
const production = (env === Profile.production);

export { development, test, production, env as Env };
