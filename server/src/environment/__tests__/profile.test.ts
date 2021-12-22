import "mocha";
import { assert } from "chai";

import { development, test, production, Env, videoModeOn } from "../profile";

describe("profile.ts", () => {
    it("should match", () => {
        assert.isTrue(test);
        assert.isFalse(development);
        assert.isFalse(production);
        assert.equal(Env, "test");
        assert.equal(videoModeOn, false);
    });
});
