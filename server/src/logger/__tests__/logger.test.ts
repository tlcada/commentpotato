import "mocha";
import * as chai from 'chai';
import * as chaiFs from 'chai-fs';
import { format } from 'date-fns'
import * as joinPath from "path";

import { createLogger } from '../logger';
import config from "../../config/config";
import { SnippetUtils } from "../../utils";

chai.use(chaiFs);
const assert = chai.assert;
const logger = createLogger(module);

describe("logger.ts", () => {
    it("should write an error message to the file", async () => {
        const dirName: string = './logs';
        SnippetUtils.removeAllFilesInFolder(dirName);
        logger.info('Test an error message');
        await SnippetUtils.sleep(100);
        const date = format(new Date(), config.logs.local.datePattern);
        const logPath: string = joinPath.join(dirName, `${date}.log`);
        assert.isNotEmpty(logPath, 'file content is empty');
    });
});
