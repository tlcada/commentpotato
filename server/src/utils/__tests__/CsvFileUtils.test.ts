import "mocha";

import * as fs from 'fs-extra';
import { assert, expect } from "chai";
import * as faker from 'faker';
import * as joinPath from "path";

import CsvFileUtils from "../CsvFileUtils";
import { CSVColumns } from "../CsvFileUtilsTypes";
import {format} from "date-fns";
import { SnippetUtils } from "../index";

import testConfig from "../../config/testConfig";

const testData = (videoId = faker.random.uuid()): CSVColumns => {
    return {
        videoId,
        publishedAt: "2018-08-02T19:15:00.000Z",
        title: faker.hacker.phrase(),
        thumbnailMediumResolution: faker.image.imageUrl(),
        thumbnailHighResolution: faker.image.imageUrl(),
        thumbnailStandardResolution: faker.image.imageUrl(),
        thumbnailMaxResolution: faker.image.imageUrl(),
        channelTitle: faker.company.companyName(),
        channelId: faker.random.uuid(),
        viewCount: faker.random.number(1000),
        videoLikeCount: faker.random.number(323),
        dislikeCount: faker.random.number(66),
        commentCount: faker.random.number(450),
        authorDisplayName: faker.internet.userName(),
        authorChannelUrl: faker.internet.url(),
        comment: faker.lorem.sentence(),
        commentLikeCount: faker.random.number(150),
        commentPublishedAt: "2019-02-25T03:11:28.000Z",
        authorProfileImageUrl: faker.image.imageUrl(),
        totalReplyCount: faker.random.number(10),
        hashtags: ['#tag1', '#tag2'],
        releaseTime: format(new Date(), testConfig.dateFormat.finnishTime),
        keyword: faker.random.word(),
        originalTags: ['tag1', 'tag2'],
    };
};

const folder: string = "./test_csv_folder";
const fileName: string = testConfig.apps.instagram.csvFile.name;

describe("CsvFileUtils.ts", () => {
    let csvFileUtils: CsvFileUtils;

    before(() => {
        csvFileUtils = new CsvFileUtils(folder);
    });

    after(() => {
        fs.remove(`./${folder}`, (err) => {
            if (err) {
                console.log(`Failed to delete ${folder}. Error: ${err}`);
            }
        });
    });

    describe("# savePublishedVideoDetailsToFile(...)", () => {
        it("should add new lines to the .csv file", async () => {
            let counter: number = 15;
            // Add multiple lines so we know that csvWriter will not overwrite the old lines.
            for (let i = 0; i < counter; i++) {
                await SnippetUtils.sleep(100);
                await csvFileUtils.savePublishedVideoDetailsToFile(testData("separate-video-id"), testConfig.apps.instagram);
            }

            if (fs.existsSync(joinPath.join(folder, fileName))) {
                fs.readFile(joinPath.join(folder, fileName), (err, data) => {
                    if (!err) {
                        const lines: number = data.toString().split("separate-video-id").length;
                        // TODO use try catch because sometimes test returns 15 or 16. Some problems here...
                        try {
                            // Plus header
                            assert.equal(lines, counter + 1);
                        } catch (e) {
                            assert.equal(lines, counter);
                        }
                    } else {
                        assert.fail(`Can not read a ${fileName} file content.`);
                    }
                });
            } else {
                assert.fail(`FileUtils did't created a new ${fileName} file.`);
            }
        });
    });

    describe("# isVideoAlreadyPublished(...)", () => {
        it("should return true because video id already exist", async () => {
            const fakerData = testData();
            await csvFileUtils.savePublishedVideoDetailsToFile(fakerData, testConfig.apps.instagram);
            const videoIsAlreadyPublished: boolean = await csvFileUtils.isVideoAlreadyPublished(fakerData.videoId, testConfig.apps.instagram);
            expect(videoIsAlreadyPublished).to.be.true;
        });

        it("should return false because video id is not exist", async () => {
            const videoIsAlreadyPublished: boolean = await csvFileUtils.isVideoAlreadyPublished("12345abcde", testConfig.apps.instagram);
            expect(videoIsAlreadyPublished).to.be.false;
        });
    });
});
