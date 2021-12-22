import { assert, expect } from "chai";

import testConfig from "../../config/testConfig";
import YouTubeVideoHandler from "../YouTubeVideoHandler";
import { YouTubeVideoSongs } from "../../config/configTypes";
import CsvFileUtils from "../../utils/CsvFileUtils";
import YouTubeHandler, { DataSource, RandomYouTubeVideoResponse } from "../../handler/YouTubeHandler";
import { addSeconds, format } from "date-fns";

const csvFileUtils: CsvFileUtils = new CsvFileUtils(testConfig.fileFolders.csvFolder);
const youTubeVideoHandler: YouTubeVideoHandler = new YouTubeVideoHandler(testConfig.apps.youTubeVideo);

describe("YouTubeVideoHandlerHandler.ts", () => {
    it("getVideoStartText(...) should match", async () => {
        const episodeNumber: number = 1;
        const videoTitle: string = `Random YouTube videos and their best comment | Episode ${ episodeNumber }`;
        const title: string = `Welcome to the Episode ${ episodeNumber } | Subscribe: https://www.youtube.com/channel/UCXmQk4PYoq5v9jIvmRgfXYg?sub_confirmation=1`;
        const fallowMe: string = `❱ Follow me on:`;
        const ig: string = `Instagram: https://www.instagram.com/commentpotato`;
        const twitter: string = `Twitter: https://twitter.com/commentpotato`;
        const facebook: string = `Facebook: https://www.facebook.com/commentpotato`;
        const website: string = `❱ More random YouTube videos and their best comment: https://www.commentpotato.com`;
        const videoLinks: string = `Link to the YouTube videos:`;
        const shouldBe: string = `${videoTitle}\r\n\r\n----\r\n\r\n${title}\r\n\r\n${fallowMe}\r\n${ig}\r\n${twitter}\r\n${facebook}\r\n\r\n${website}\r\n\r\n${videoLinks}\r\n\r\n`;
        assert.equal(await youTubeVideoHandler.getVideoStartText(episodeNumber), shouldBe);
    });

    it("getVideoEndText(...) should match", async () => {
        const song: YouTubeVideoSongs = youTubeVideoHandler.getSong(0);
        const tags: string[] = ["1", "2"];
        const title: string = `Music for this video:`;
        const name: string = `${song.name}`;
        const link: string = `Link: ${song.link}`;
        const license: string = `License: ${song.license}`;
        const shouldBe: string = `\r\n${title}\r\n\r\n${name}\r\n${link}\r\n${license}\r\n\r\n----\r\n\r\n${tags.join(", ")}\r\n`;
        assert.equal(youTubeVideoHandler.getVideoEndText(song, tags), shouldBe);
    });

    it("getSong(...) should match", async () => {
        const song: YouTubeVideoSongs = youTubeVideoHandler.getSong(0);
        expect(song).to.have.deep.include({
            name: "Wholesome by Kevin MacLeod",
            link: "https://incompetech.filmmusic.io/song/5050-wholesome",
            license: "http://creativecommons.org/licenses/by/4.0/",
            fileName: "wholesome-by-kevin-macleod-from-filmmusic-io.mp3"
        });
    });

    it("getVideoMiddleText(...) should match", async () => {
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.youTubeVideo, [], true);

        const helperDate: Date = addSeconds(new Date(0), 87);
        const time: string = format(helperDate, "mm:ss");
        const link: string = `${youtubeVideo.video.title}: https://youtu.be/${youtubeVideo.video.videoId}`;
        const shouldBe: string = `${time} ${link}\r\n`;

        const description: string = youTubeVideoHandler.getVideoMiddleText(youtubeVideo, 87);
        assert.equal(description, shouldBe);
    });
});
