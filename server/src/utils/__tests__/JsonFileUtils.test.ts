import "mocha";
import * as fs from 'fs-extra';
import { assert } from "chai";
import * as faker from 'faker';
import * as jsonfile  from 'jsonfile';
import * as joinPath from "path";

import JsonFileUtils from "../JsonFileUtils";
import testConfig from "../../config/testConfig";

const testData = (): any => {
    return {
        videoId: faker.random.uuid(),
        title: faker.hacker.phrase()
    };
};

const folder = "./test_json_files";
const fileName = testConfig.apps.webpage.jsonFile.name;

describe("JsonFileUtils.ts", () => {
    let jsonFileUtils: JsonFileUtils;

    before(() => {
        jsonFileUtils = new JsonFileUtils(folder);
    });

    after(() => {
        fs.remove(folder, (err) => {
            if (err) {
                console.log(`Failed to delete ${folder}. Error: ${err}`);
            }
        });
    });

    describe("# savePublishedVideoDetailsToFile(...)", () => {
        it("should add new object to the .json file", async () => {
            await jsonFileUtils.savePublishedVideoDetailsToFile([testData(), testData(), testData()], fileName, testConfig.apps.webpage);

            if (fs.existsSync(joinPath.join(folder, fileName))) {
                try {
                    const jsonObject = await jsonfile.readFile(joinPath.join(folder, fileName));
                    assert.equal(jsonObject.length, 3);
                } catch (err) {
                    assert.fail(`Can not read a ${fileName} file content.`);
                }
            } else {
                assert.fail(`FileUtils did't created a new ${fileName} file.`);
            }
        });
    });
});
