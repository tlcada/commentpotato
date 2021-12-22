import "mocha";
import { assert } from "chai";

import YouTubeHandler, { DataSource, RandomYouTubeVideoResponse } from "../YouTubeHandler";
import CsvFileUtils from "../../utils/CsvFileUtils";
import TwitterHandler, { TweetResponse } from "../TwitterHandler";

import testConfig from "../../config/testConfig";
import { SnippetUtils } from "../../utils";

const csvFileUtils: CsvFileUtils = new CsvFileUtils(testConfig.fileFolders.csvFolder);

describe("TwitterHandler.ts", () => {
    it("should return valid tweet when title is not disabled", async () => {
        const twitterHandler = new TwitterHandler();
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.twitter, [], true);
        try {
            testConfig.apps.twitter.tweet.disableTitle = false;
            testConfig.apps.twitter.tweet.images.useCustomThumbnailImage = false;
            const tweetResponse: TweetResponse | null = twitterHandler.getTweet(youtubeVideo, testConfig.apps.twitter, []);
            if (tweetResponse === null) {
                assert.fail(`Tweet can not be null.`);
            }

            let hashTags: string;
            let comment: string;

            // TODO test tweet do not return hashtags for some reason as it should be...
            if (tweetResponse.tweet.includes("#royale") && tweetResponse.tweet.includes("switch")) {
                comment = "challenge ideas: no volume challengeSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their loadoutswitch ...";
                hashTags = `#muselk #royale #fortnite #fortnitebr`;
            } else if (tweetResponse.tweet.includes("#royale")) {
                comment = "challenge ideas: no volume challengeSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their ...";
                hashTags = `#muselk #royale #fortnite #fortnitebr`;
            } else {
                comment = "challenge ideas: no volume challengeSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their loadoutswitch the A and the D controls (A";
                if (!tweetResponse.containsRandomEmoji) {
                    comment += " you";
                }
                comment += " ...";
                hashTags = '#muselk';
            }

            const tweetTitle: string = `THANOS *TRAP* TROLLING In ...`;
            const youTubeVideoLink: string = `youtu.be/KhcQl2y0n4A`;
            const commentedBy: string = `commented by Hallen Ettles`;
            comment = tweetResponse.containsRandomEmoji ? " " + comment : comment;
            assert.equal(SnippetUtils.removeInvalidCharacters(tweetResponse.tweet), `${tweetTitle}${comment}${youTubeVideoLink} ${commentedBy} ${hashTags}`);
        } catch (err) {
            assert.fail(err.message);
        }
    });

    // TODO works only if you run both test? Both test do not return hashtags for some reason as it should be...
    it("should return valid tweet when title is disabled", async () => {
        const twitterHandler: TwitterHandler = new TwitterHandler();
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const ownHashtags: string[] = ["#test1", "#test2"];
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.twitter, ownHashtags, true);
        try {
            testConfig.apps.twitter.tweet.disableTitle = true;
            testConfig.apps.twitter.tweet.images.useCustomThumbnailImage = false;
            const tweetResponse: TweetResponse | null = twitterHandler.getTweet(youtubeVideo, testConfig.apps.twitter, ownHashtags);
            if (tweetResponse === null) {
                assert.fail(`Tweet can not be null.`);
            }

            let comment: string = "challenge ideas: no volume challengeSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their loadoutswitch the A and the D controls (A makes you go right and D ...";
            const youTubeVideoLink: string = `youtu.be/KhcQl2y0n4A`;
            const hashTags: string = `#test1 #test2`;
            const commentedBy: string = `commented by Hallen Ettles`;
            assert.equal(SnippetUtils.removeInvalidCharacters(tweetResponse.tweet), `${comment}${youTubeVideoLink} ${commentedBy} ${hashTags}`);
        } catch (err) {
            assert.fail(err.message);
        }
    });

    it("should return valid tweet when title is disabled and custom image is on", async () => {
        const twitterHandler: TwitterHandler = new TwitterHandler();
        const youtubeHandler: YouTubeHandler = new YouTubeHandler(DataSource.VALID_DUMMY_DATA, csvFileUtils);
        const youtubeVideo: RandomYouTubeVideoResponse = await youtubeHandler.findRandomYouTubeVideo(testConfig.apps.twitter, [],true);
        try {
            testConfig.apps.twitter.tweet.disableTitle = true;
            testConfig.apps.twitter.tweet.images.useCustomThumbnailImage = true;
            const tweetResponse: TweetResponse | null = twitterHandler.getTweet(youtubeVideo, testConfig.apps.twitter, []);
            if (tweetResponse === null) {
                assert.fail(`Tweet can not be null.`);
            }

            let comment: string = "challenge ideas: no volume challengeSwitch loadout challenge. Where when you get a kill, you swap your ENTIRE loadout to their loadoutswitch the A and the D controls (A makes you go right and D makes you go left)switch the ...";
            const youTubeVideoLink: string = `youtu.be/KhcQl2y0n4A`;
            const hashTags: string = `#muselk`;
            assert.equal(SnippetUtils.removeInvalidCharacters(tweetResponse.tweet), `${comment}${youTubeVideoLink}${hashTags}`);
        } catch (err) {
            assert.fail(err.message);
        }
    });
});
