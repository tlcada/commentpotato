import React from "react";
import SnippetUtils from "../SnippetUtils";

describe('SnippetUtils', () => {
    it("addThousandsSeparators(...) method should add thousands separators", () => {
        expect(SnippetUtils.addThousandsSeparators(600)).toEqual("600");
        expect(SnippetUtils.addThousandsSeparators(25000000)).toEqual("25,000,000");
        expect(SnippetUtils.addThousandsSeparators(5000000)).toEqual("5,000,000");
        expect(SnippetUtils.addThousandsSeparators(6)).toEqual("6");
        expect(SnippetUtils.addThousandsSeparators(6000)).toEqual("6,000");
        expect(SnippetUtils.addThousandsSeparators(60000)).toEqual("60,000");
        expect(SnippetUtils.addThousandsSeparators(0)).toEqual("0");
    });

    it("getAuthHeader(...) method should return Authorization Bearer header", () => {
        expect({ "map": { "authorization": "Bearer 12345" }}).toEqual(SnippetUtils.getAuthHeader("12345"));
    });

    it("reduceCommentSize(...) method should reduce comment size", () => {
        const comment: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \n\r sed do eiusmod tempor incididunt \n ut labore et dolore magna aliqua.";
        expect({ isCommentValid: true, comment: comment }).toEqual(SnippetUtils.reduceCommentSize(comment, 150, 3));
        expect({ isCommentValid: false, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, ..." }).toEqual(SnippetUtils.reduceCommentSize(comment, 150, 1));
        expect({ isCommentValid: false, comment: "Lorem ..." }).toEqual(SnippetUtils.reduceCommentSize(comment, 10, 3));
        expect({ isCommentValid: false, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, ..." }).toEqual(SnippetUtils.reduceCommentSize(comment, 70, 1));
        expect({ isCommentValid: false, comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, \n\r sed do ..." }).toEqual(SnippetUtils.reduceCommentSize(comment, 70, 2));
    });

    it("replaceMultipleLineBreak(...) method should replace multiple line breaks", () => {
        expect(SnippetUtils.replaceMultipleLineBreak("Test \n\n\n message")).toEqual("Test \n message");
    });
});
