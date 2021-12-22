import "mocha";

import * as fetchMock from 'fetch-mock';
import { expect, assert } from "chai";

import { get, post, errorResponseFormatter } from "../call";

describe("call.ts", () => {
    describe("# get(...)", () => {
        it("should return json object with status code 200", async () => {
            fetchMock.get('http://example.com', { dummyResponse: "yeet" });
            const response = await get('http://example.com');
            expect(response).to.deep.equal({ dummyResponse: "yeet" });
            fetchMock.reset();
        });

        it("should throw error response with invalid status code", async () => {
            fetchMock.get('http://example.com', 404);

            try {
                await get('http://example.com');
                assert.fail("Should throw error");
            } catch (e) {
                assert.isOk('everything', 'everything is ok');
            }

            fetchMock.reset();
        });
    });

    describe("# post(...)", () => {
        it("should return json object with status code 200", async () => {
            fetchMock.post('http://example.com', { dummyResponse: "yeet" });
            const response = await post('http://example.com', new Headers(), {});
            expect(response).to.deep.equal({ dummyResponse: "yeet" });
            fetchMock.reset();
        });

        it("should throw error response with invalid status code", async () => {
            fetchMock.post('http://example.com', 500);

            try {
                await post('http://example.com', new Headers(), {});
                assert.fail("Should throw error");
            } catch (e) {
                assert.isOk('everything', 'everything is ok');
            }

            fetchMock.reset();
        });
    });

    describe("# errorResponseFormatter(...)", () => {
        it("should return valid json object", async () => {
            const errorResponse = errorResponseFormatter({ status: 500, message: "message example" });
            expect(errorResponse).to.deep.equal({ status: 500, message: "message example" });
        });

        it("should return valid json object with default message", async () => {
            const errorResponse = errorResponseFormatter({ status: 500, message: null });
            expect(errorResponse).to.deep.equal({ status: 500, message: "General error" });
        });
    });
});