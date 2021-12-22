import * as fs from "fs-extra";
import { assert } from "chai";
import * as joinPath from "path";

import BasicFileUtils from "../BasicFileUtils";
import { SnippetUtils } from "../index";
import { RandomYouTubeVideoResponse } from "../../handler/YouTubeTypes";
import YouTubeHandler, { DataSource } from "../../handler/YouTubeHandler";
import CsvFileUtils from "../../utils/CsvFileUtils";
import testConfig from "../../config/testConfig";

const csvFileUtils: CsvFileUtils = new CsvFileUtils(testConfig.fileFolders.csvFolder);
const folder = "./test_instagram_folder";

describe("BasicFileUtils.ts", () => {
    let basicFileUtils: BasicFileUtils;

    before(() => {
        basicFileUtils = new BasicFileUtils(folder);
    });

    after(() => {
        fs.remove(`./${folder}`, (err) => {
            if (err) {
                console.log(`Failed to delete ${folder}. Error: ${err}`);
            }
        });
    });

    describe("# saveInstagramImageDetailsToFile(...)", () => {
        it("should add new lines to the .txt file", async () => {
            const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
            const webPageObject: RandomYouTubeVideoResponse[] = [];

            for (let i = 0; i < 2; i++) {
                await SnippetUtils.sleep(100);
                const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.instagram, [], true);
                webPageObject.push(youtubeVideo);
            }

            const fileName: string = testConfig.apps.instagram.images.weekly.imageDetailsFile;
            const path: string = joinPath.join(folder, fileName);
            await basicFileUtils.saveInstagramImageDetailsToFile(webPageObject, fileName);

            if (fs.existsSync(path)) {
                fs.readFile(path, (err, data) => {
                    if (!err) {
                        const actualText: string = data.toString();
                        const title: string = "Muselk - Video is published before: false";
                        const videoTitle: string = "THANOS *TRAP* TROLLING In Fortnite Battle Royale!";
                        const link: string = "Link to the @muselk video and best comment: https://www.youtube.com/watch?v=KhcQl2y0n4A";
                        const hashtags: string = "#muselk #followme #funnypictures #humor #sarcasm #youtube #bestcomments #commentpotato #youtubecomments #youtubecomment";
                        const line: string = "------------------------";
                        const resultRow: string = `${ title }<br /><br />${ videoTitle }<br /><br />${ link }<br /><br />${hashtags}<br /><br />${ line }<br /><br />`;
                        assert.equal(SnippetUtils.replaceLineBreakWithBr(actualText), `1. ${ resultRow }2. ${ resultRow }`);
                    } else {
                        assert.fail(`Can not read a ${fileName} file content.`);
                    }
                });
            } else {
                assert.fail(`FileUtils did't created a new ${fileName} file.`);
            }
        });
    });

    describe("# zipAndRemove(...)", () => {
        it("should create a .zip file", async () => {
            const fileName: string = testConfig.apps.instagram.images.weekly.zipFileName;
            await basicFileUtils.zipAndRemove(fileName, testConfig.apps.instagram, ["txt", "png"]);
            const path: string = joinPath.join(folder, fileName);
            if (fs.existsSync(path)) {
                assert.isOk('everything', 'everything is ok')
            } else {
                assert.fail(`BasicFileUtils did't created a new ${fileName} .zip file.`);
            }
        });

        it("should remove all files except a .zip file", async () => {
            const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
            const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.instagram, [], true);

            const txtFileName: string = testConfig.apps.instagram.images.weekly.imageDetailsFile;
            await basicFileUtils.saveInstagramImageDetailsToFile([youtubeVideo], txtFileName);

            const zipFileName: string = testConfig.apps.instagram.images.weekly.zipFileName;
            await basicFileUtils.zipAndRemove(zipFileName, testConfig.apps.instagram, ["txt", "png"]);

            await SnippetUtils.sleep(250);

            if (fs.existsSync(joinPath.join(folder, txtFileName))) {
                assert.fail(`BasicFileUtils did't removed ${txtFileName} file.`);
            } else {
                assert.isOk('everything', 'everything is ok');
            }
        });
    });
});
