import "mocha";
import * as chai from "chai";
import * as write from "write";
import * as fs from "fs-extra";
import * as joinPath from "path";

import { SnippetUtils } from "../";

const assertArrays = require("chai-arrays");
chai.use(assertArrays);
const assert = chai.assert;
const expect: any = chai.expect;

describe("SnippetUtils.ts", () => {
    it("replaceSpace(...) method should replace spaces", () => {
        assert.equal(SnippetUtils.replaceSpace("test text with spaces"), "testtextwithspaces");
    });

    it("getRandomArrayIndex(...) method should return random index from array", async () => {
        const arrayIndex = ['text', 'text2', 'text3'];
        expect(SnippetUtils.getRandomArrayIndex(arrayIndex)).to.be.within(0, 2);
    });

    it("replaceNewlineWithTwitterLineEnding(...) method should replace \n", () => {
        const text = "Test \n with \r\n newlines";
        assert.equal(SnippetUtils.replaceNewlineWithTwitterLineEnding(text), "Test \r\n with \r\n newlines");
    });

    it("getRandomInt(...) method should return random int", () => {
        let numbers: Array<number> = [];
        for(let i: number = 0; i < 50; i++) {
            numbers[i] = SnippetUtils.getRandomInt(2, 6);
        }
        const smallestNumber = Math.min.apply(Math, numbers);
        const biggestNumber = Math.max.apply(Math, numbers);
        expect(smallestNumber).to.be.at.least(2);
        expect(biggestNumber).to.be.below(7);
    });

    it("addThousandsSeparators(...) method should add thousands separators", () => {
        assert.equal(SnippetUtils.addThousandsSeparators(600), "600");
        assert.equal(SnippetUtils.addThousandsSeparators(25000000), "25,000,000");
        assert.equal(SnippetUtils.addThousandsSeparators(5000000), "5,000,000");
        assert.equal(SnippetUtils.addThousandsSeparators(6), "6");
        assert.equal(SnippetUtils.addThousandsSeparators(6000), "6,000");
        assert.equal(SnippetUtils.addThousandsSeparators(60000), "60,000");
        assert.equal(SnippetUtils.addThousandsSeparators(0), "0");
    });

    it("addThousandsSeparators(...) method should replace \r\n with br tag", () => {
        assert.equal(SnippetUtils.replaceLineBreakWithBr("I will be here in:\r\n\r\n2014:✅\r\n2015:✅\r\n2016:✅\r\n2017:✅\r\nr2018:✅ so i will remember."), "I will be here in:<br /><br />2014:✅<br />2015:✅<br />2016:✅<br />2017:✅<br />r2018:✅ so i will remember.");
        assert.equal(SnippetUtils.replaceLineBreakWithBr("U know the drill...\n1: Ronaldo \n2:Neymar \r\n3:Messi \n4:Ronney\n5:Lewandoski\n6:Pogba \r7:Mbappe"), "U know the drill...<br />1: Ronaldo <br />2:Neymar <br />3:Messi <br />4:Ronney<br />5:Lewandoski<br />6:Pogba <br />7:Mbappe");
    });

    it("sleep(...) method should return Promise", () => {
        const sleepTime = SnippetUtils.sleep(1);
        if (sleepTime instanceof Promise) {
            assert.isOk('Everything', 'Everything is ok');
        } else {
            assert.fail(`Sleep method not return Promise`);
        }
    });

    it("removeNonAlphanumericChars(...) method should remove all non-alphanumeric chars", () => {
        assert.equal(SnippetUtils.removeNonAlphanumericChars("Hello! 1 isn't & you ( # Me"), "Hello1isntyouMe");
    });

    it("removeInvalidCharacters(...) method should remove all invalid chars", () => {
        assert.equal(SnippetUtils.removeInvalidCharacters("Hello! 1 isn't 😃 - � !#¤%&/()=?`*^][{$£ <br /> you \r\n ( Me"), "Hello! 1 isn't - !#%&/()=?`*^][{$ <br /> you ( Me");
    });

    it("removeWordFromEnd(...) method should slice text", () => {
        const testText: string = "Lorem #ipsum dolor| & (sit) amet, consectetur adipiscing elit.";
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 7), "Lorem #ipsum dolor| & (sit) amet, consectetur ...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 7, false), "Lorem #ipsum dolor| & (sit) amet, consectetur...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 16), "Lorem #ipsum dolor| & (sit) amet ...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 3), "Lorem #ipsum dolor| & (sit) amet, consectetur ...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 3, false), "Lorem #ipsum dolor| & (sit) amet, consectetur adipiscing...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 62), "");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 0), testText);
        assert.equal(SnippetUtils.removeWordFromEnd(testText, -30), testText);
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 37), "Lorem #ipsum dolor| ...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 39), "Lorem #ipsum dolor ...");
        assert.equal(SnippetUtils.removeWordFromEnd(testText, 41), "Lorem #ipsum ...");
    });

    it("removeCharFromEnd(...) method should slice text", () => {
        const testText: string = "Hello! 1 isn't & you ( # Me";
        assert.equal(SnippetUtils.removeCharFromEnd(testText, 7), "Hello! 1 isn't & ...");
        assert.equal(SnippetUtils.removeCharFromEnd(testText, 7, false), "Hello! 1 isn't &...");
        assert.equal(SnippetUtils.removeCharFromEnd(testText, 100), " ...");
        assert.equal(SnippetUtils.removeCharFromEnd(testText, 0), "Hello! 1 isn't & you (  ...");
        assert.equal(SnippetUtils.removeCharFromEnd(testText, -30), "H ...");
    });

    it("removeAllFilesInFolder(...) method should remove all files from folder", async () => {
        const folder: string = "snippet_test_folder";
        const fileName: string = "dummy_file.txt";

        SnippetUtils.createFolderIfNotExist(folder);
        await write(joinPath.join(folder, fileName), "Hello World!", { overwrite: true });
        SnippetUtils.removeAllFilesInFolder(folder);
        await SnippetUtils.sleep(100);

        if (fs.existsSync(joinPath.join(folder, fileName))) {
            assert.fail(`File should not exist`);
        } else {
            assert.isOk('Everything', 'Everything is ok');
        }

        fs.remove(folder, (err) => {
            if (err) {
                console.log(`Failed to delete ${folder}. Error: ${err}`);
            }
        });
    });

    it("buildHashTag(...) should build hashtags", () => {
        assert.equal(SnippetUtils.buildHashTag("Hello! 1 isn't & you ( # Me"), "helloisnt");
        assert.equal(SnippetUtils.buildHashTag("bruno i mars 2 when i was your man karaoke"), "brunomars");
        assert.equal(SnippetUtils.buildHashTag("hello 엑소 "), "hello");
        assert.equal(SnippetUtils.buildHashTag(""), "");
        assert.equal(SnippetUtils.buildHashTag("you are the car 4398"), "youare");
    });

    it("buildHashTagsByTags(...) should build hashtags array", () => {
        const hashTags_1: string[] = [
            "bruno mars when i was your man instrumental",
            "sing king karaoke",
            "sing king",
            "bruno mars when i was your man karaoke",
            "bruno mars karaoke",
            "bruno mars lyrics",
            "bruno mars songs karaoke",
            "bruno mars songs lyrics",
            "bruno mars when i was your man lyrics",
            "when i was your man karaoke",
            "when i was your man lyrics",
            "when i was your man instrumental",
            "when i was your man bruno mars karaoke",
            "when i was your man bruno mars lyrics",
            "when i was your man bruno mars instrumental"
        ];

        const hashTags_2: string[] = [
            "fortnite",
            "fortnite game",
            "hello",
            "you are the car 4398"
        ];

        expect(["#whenwas", "#singking", "#brunomars"]).to.be.equalTo(SnippetUtils.buildHashTagsByTags(hashTags_1, 8));
        expect(["#hello", "#youare"]).to.be.equalTo(SnippetUtils.buildHashTagsByTags(hashTags_2, 2));
        expect(["#hello", "#youare", "#fortnite", "#fortnitegame"]).to.be.equalTo(SnippetUtils.buildHashTagsByTags(hashTags_2, 4));
    });

    it("sortArray(...) should sort array", () => {
        const array: string[] = ["123", "abc", "ab", "wef324r", ""];
        expect(["", "ab", "123", "abc", "wef324r"]).to.be.equalTo(SnippetUtils.sortArray(array));
    });

    it("createLinuxFriendlyName(...) should parse string", () => {
        assert.equal(SnippetUtils.createLinuxFriendlyName("you_ the-car 4398"), "you_the_car4398");
    });

    it("hashtagCreator(...) should create hashtags", () => {
        expect([]).to.be.equalTo(SnippetUtils.hashtagCreator(undefined));
        expect([]).to.be.equalTo(SnippetUtils.hashtagCreator(null));
        expect(["#whenwas", "#singking", "#brunomars"]).to.be.equalTo(SnippetUtils.hashtagCreator("whenwas,singking,brunomars"));
        expect(["#whenwas", "#singking", "#brunomars"]).to.be.equalTo(SnippetUtils.hashtagCreator("whenwas, singking, brunomars"));
        expect(["#whenwas", "#singking", "#brunomars"]).to.be.equalTo(SnippetUtils.hashtagCreator("         whenwas,     singking, brunomars"));
    });
});
