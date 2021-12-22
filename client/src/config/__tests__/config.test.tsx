import React from "react";
import config from '../config';

describe('config', () => {
    it('config file settings should match', () => {

        const expectedResult = {
            webPageJsonUrl: "http://localhost:3000/api/v1/webpage_data",
            youtube: {
                channelUrl: "https://www.youtube.com/channel",
                videoUrl: "https://www.youtube.com/watch?v=",
            },
            videoList: {
                commentMaxLength: 140,
                maxLineSpaceNumber: 4
            }
        };

        expect(expect.objectContaining(config)).toEqual(expectedResult);
    });
});
