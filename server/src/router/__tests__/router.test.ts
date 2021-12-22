import "mocha";
import * as jwt from "jsonwebtoken";
import { format } from "date-fns";
import * as fs from 'fs-extra';
import * as joinPath from "path";

const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const assert = chai.assert;

import { createLogger } from '../../logger/logger';
import config from "../../config/config";

const server = require("../../server");
const logger = createLogger(module);

describe("router.ts", () => {

    describe("# .../csv_history/:appName", () => {

        after(() => {
            fs.remove(`./${config.fileFolders.csvFolder}`, (err) => {
                if (err) {
                    console.log(`Failed to delete ${config.fileFolders.csvFolder}. Error: ${err}`);
                }
            });
        });

        it("should return .csv file with app name and basic authentication", () => {
            const path: string = joinPath.join(config.fileFolders.csvFolder, config.apps.twitter.csvFile.name);
            if (!fs.existsSync(path)) {
                fs.writeFile(path, "", (err) => {
                    if (err) {
                        assert.fail(err.message);
                    }
                });
            }

            chai
                .request(server.listen())
                .get(`/api/v1/csv_history/twitter`)
                .auth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD)
                .then((res: any) => expect(res).to.have.status(200))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
            });
        });

        it("should return 404 with invalid app name", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/csv_history/invalid_app`)
                .auth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD)
                .then((res: any) => expect(res).to.have.status(404))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it("should return 401 without valid credentials", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/csv_history/twitter`)
                .auth('invalid', 'invalid')
                .then((res: any) => expect(res).to.have.status(401))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });
    });

    describe("# .../logs/:logFileDate", () => {
        it("should return .log file with log file date and basic authentication", () => {
            // Create log file
            logger.info("router.test.ts dummy log");

            chai
                .request(server.listen())
                .get(`/api/v1/logs/${format(new Date(), config.logs.local.datePattern)}`)
                .auth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD)
                .then((res: any) => expect(res).to.have.status(500))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it("should return 404 with invalid log file date", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/logs/2019-12-01`)
                .auth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD)
                .then((res: any) => expect(res).to.have.status(404))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it("should return 401 without valid credentials", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/csv_history/${format(new Date(), config.logs.local.datePattern)}`)
                .auth('invalid', 'invalid')
                .then((res: any) => expect(res).to.have.status(401))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });
    });

    describe("# .../auth", () => {
        it("should return JWT if authorization header is valid", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/auth`)
                .auth(process.env.BASIC_AUTH_USERNAME, process.env.BASIC_AUTH_PASSWORD)
                .then((res: any) => expect(res).to.have.status(200))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it("should return 401 without valid credentials", () => {
            chai
                .request(server.listen())
                .get(`/api/v1/auth`)
                .auth('invalid', 'invalid')
                .then((res: any) => expect(res).to.have.status(401))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });
    });

    describe("# .../webpage_data", () => {

        after(() => {
            fs.remove(`./${config.fileFolders.jsonFolder}`, (err) => {
                if (err) {
                    console.log(`Failed to delete ${config.fileFolders.jsonFolder}. Error: ${err}`);
                }
            });
        });

        it('should throw 401 if no authorization header', () => {
            chai
                .request(server.listen())
                .get(`/api/v1/webpage_data`)
                .then((res: any) => expect(res).to.have.status(401))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it('should return 401 if authorization header is malformed', () => {
            chai
                .request(server.listen())
                .get(`/api/v1/webpage_data`)
                .set('Authorization', 'wrong')
                .then((res: any) => expect(res).to.have.status(401))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });

        it('should work if authorization header is valid jwt', async () => {
            const path: string = joinPath.join(config.fileFolders.jsonFolder, config.apps.webpage.jsonFile.name);
            if (!fs.existsSync(path)) {
                fs.writeFile(path, JSON.stringify([null]), (err) => {
                    if (err) {
                        assert.fail(err.message);
                    }
                });
            }

            const token = await jwt.sign({ subject: 1 }, process.env.JWT_SECRET);

            chai
                .request(server.listen())
                .get(`/api/v1/webpage_data`)
                .set('Authorization', 'Bearer ' + token)
                .then((res: any) => expect(res).to.have.status(200))
                .catch((err: any) => {
                    assert.fail(err.message);
                });
        });
});
