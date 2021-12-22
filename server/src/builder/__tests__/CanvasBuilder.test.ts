import { expect } from "chai";
import * as fs from "fs-extra";

import { RandomYouTubeVideoResponse } from "../../handler/YouTubeTypes";
import CanvasBuilder from "../CanvasBuilder";

const canvasTestFolderPath: string = "canvas_test_images";
const youtubeObject: RandomYouTubeVideoResponse[] = require("../../../dummy_data/valid/webpage.json");

describe("CanvasBuilder", () => {
    let canvasBuilder: CanvasBuilder;

    before(() => {
        canvasBuilder = new CanvasBuilder(canvasTestFolderPath, true);
    });

    after(async () => {
        fs.removeSync(canvasTestFolderPath);
    });

    it("should build images", async () => {
        let maxNumberOfImages: number = 1;

        for (let i = 0; i < youtubeObject.length; i++) {
            if (i < maxNumberOfImages) {
                await canvasBuilder.buildCanvasImage(youtubeObject[i]);
                await canvasBuilder.buildCanvasImage(youtubeObject[i], true);
            } else {
                break;
            }
        }

        const files: string[] = await fs.promises.readdir(canvasTestFolderPath);
        expect(maxNumberOfImages * 2).to.equal(files.length);
    });
});
