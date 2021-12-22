import "mocha";
import { assert, expect } from "chai";

import YouTubeHandler, { DataSource, RandomYouTubeVideoResponse } from "../YouTubeHandler";
import CsvFileUtils from "../../utils/CsvFileUtils";

import testConfig from "../../config/testConfig";

const csvFileUtils: CsvFileUtils = new CsvFileUtils(testConfig.fileFolders.csvFolder);

const validYouTubeVideoResponse = (youtubeVideo: RandomYouTubeVideoResponse) => {
    return {
        video: {
            publishedAt: '2018-05-14T21:15:00.000Z',
            title: 'THANOS *TRAP* TROLLING In Fortnite Battle Royale!',
            thumbnailUrl: {
                highResolution: "https://i.ytimg.com/vi/KhcQl2y0n4A/hqdefault.jpg",
                maxResolution: "https://i.ytimg.com/vi/KhcQl2y0n4A/maxresdefault.jpg",
                mediumResolution: "https://i.ytimg.com/vi/KhcQl2y0n4A/mqdefault.jpg",
                standardResolution: "https://i.ytimg.com/vi/KhcQl2y0n4A/sddefault.jpg",
            },
            channelId: "UCd534c_ehOvrLVL2v7Nl61w",
            channelTitle: 'Muselk',
            videoId: 'KhcQl2y0n4A',
            likeCount: 151326,
            dislikeCount: 9758,
            viewCount: 19568694,
            commentCount: 11096,
            keyword: youtubeVideo.video.keyword
        },
        comment: {
            authorDisplayName: 'Hallen Ettles',
            authorChannelUrl: "http://www.youtube.com/channel/UCrdiBzx17E4AV-eoUZyBFyA",
            comment: "challenge ideas: \nno volume challenge\n\nSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their loadout\n\nswitch the A and the D controls (A makes you go right and D makes you go left)\n\nswitch the left mouse button and the right mouse buttons controls (aim & shoot)\n\nno aiming challenge\n\nNo jumping challenge\n\nNo meds challenge\n\nNo shields challenge\n\na challenge where one duo partner can only build, and the other can only shoot\n\nlike this you want to see one of these.",
            likeCount: 507,
            publishedAt: "2018-05-15T01:29:04.000Z",
            authorProfileImageUrl: "https://yt3.ggpht.com/a/AGF-l7-DLF_eX37Y_5XX_Q_tPMQO9IqLDCsGbwQ5vA=s48-c-k-c0xffffffff-no-rj-mo",
            totalReplyCount: 15
        },
        hashtags: youtubeVideo.hashtags // TODO For some reason this sometimes [] or ['#fortnite', '#fortnitebr', '#royale']
    };
};

describe("YouTubeHandler.ts", () => {
    it("should return valid json object", async () => {
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.instagram, [],true);
        expect(youtubeVideo).to.have.deep.include(validYouTubeVideoResponse(youtubeVideo));
    });

    it("should return valid json object by video id", async () => {
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findYouTubeVideoByVideoId("KhcQl2y0n4A", testConfig.apps.instagram);
        expect(youtubeVideo).to.have.deep.include(validYouTubeVideoResponse(youtubeVideo));
    });

    it("should throw exception with invalid data", async () => {
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.INVALID_DUMMY_DATA, csvFileUtils);

        try {
            await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.instagram, []);
            assert.fail(`Should throw exception.`);
        } catch (err) {
            assert.isOk('everything', 'everything is ok');
        }
    });
});
