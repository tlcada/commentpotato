import "mocha";
import { assert } from "chai";

import { YouTubeException } from "../";

describe("YouTubeException.ts", () => {
    it("should throw exception", () => {
        try {
            throw new YouTubeException("my error");
        } catch (err) {
            if (err instanceof YouTubeException) {
                assert.equal(err.message, "my error");
            } else {
                assert.fail(`Wrong exception.`);
            }
        }
    });
});