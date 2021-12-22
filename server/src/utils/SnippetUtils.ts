import * as fs from "fs";

import { createLogger } from "../logger/logger";
import * as joinPath from "path";
const logger = createLogger(module);

class SnippetUtils {

    public static replaceSpace(str: string, replaceValue: string = "") {
        return str.replace(/\s+/g, replaceValue);
    }

    public static createLinuxFriendlyName(str: string) {
        str = str.replace(/-/g, "_");
        return this.replaceSpace(str);
    }

    public static replaceNewlineWithTwitterLineEnding(str: string) {
        return str.replace(/\r?\n/g, "\r\n");
    }

    public static removeNonAlphanumericChars(str: string, replaceValue: string = "") {
        return str.replace(/\W/g, replaceValue);
    }

    public static removeInvalidCharacters(str: string, replaceValue: string = "") {
        str = str.replace(/[^\x20-\x7E]+/g, replaceValue);
        // Remove all multiple spaces
        return str.replace(/ +(?= )/g, "");
    }

    public static addThousandsSeparators(basicNumber: number): string {
        return basicNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public static replaceLineBreakWithBr(str: string): string {
        return str.replace(/(?:\r\n|\r|\n)/g, "<br />");
    }

    public static getRandomArrayIndex(arrayValues: any[]): number {
        return Math.floor(Math.random() * arrayValues.length);
    }

    public static sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    public static buildHashTagsByTags(tags: string[], maxNumberOfHashtags: number): string[] {
        if (!tags) {
            return [];
        }

        tags = tags.map((hashTag: string) => {
            const replacedSpace: string = SnippetUtils.buildHashTag(hashTag);
            if (replacedSpace.length > 0) {
                return `#${replacedSpace.toLowerCase()}`;
            } else {
                return "";
            }
        }).filter((el: string) => el !== null && el !== "");

        // Step 1. Remove duplicate values from array
        tags = [...new Set(tags)];
        // Step 2. Sort array
        tags = this.sortArray(tags);
        // Step 3. Splice array
        tags = tags.splice(0, maxNumberOfHashtags);
        return tags;
    }

    public static buildHashTag(str: string): string {
        // Maximum hashtag length is 16
        const hashtagMaxLength: number = 16;
        const hashtagNumberOfJoinedWords: number = 2;

        str = str.toLowerCase();
        // Remove all characters except alphanumeric and spaces with javascript
        str = str.replace(/[^\w\s]/gi, "");
        str = str.replace(/[0-9]/g, "");
        if (str.length >= hashtagMaxLength) {
            // Remove the word if the length is less than 3. For example, do not add: on, if, I...
            const words: string[] = str.split(" ").filter((word: string) => word.length > hashtagNumberOfJoinedWords);
            let finalHashTag: string = "";
            for (let i = 0; i < words.length; i++) {
                // 2 word is maximum
                if (i > 1) {
                    break;
                }
                finalHashTag += words[i];
            }
            return finalHashTag;
        } else {
            return this.replaceSpace(str);
        }
    }

    public static hashtagCreator(hashtags: string | undefined): string[] {
        if (!hashtags) {
            return [];
        }

        const tags: string[] = hashtags.split(",");
        return tags.map((tag: string) => `#${tag.trim()}`);
    }

    public static sortArray(array: string[]): string[] {
        return array.sort((a, b) => {
            if (a.length > b.length) {
                return 1;
            } else if (a.length < b.length) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    public static getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public static removeWordFromEnd(text: string, numberOfRemovedChars: number, dotWithSpace: boolean = true) {
        if (numberOfRemovedChars >= text.length) {
            return "";
        } else if (numberOfRemovedChars <= 0) {
            return text;
        }

        const dots: string = dotWithSpace ? " ..." : "...";
        const textMaxLength: number = (text.length - numberOfRemovedChars) - dots.length;
        const words: string[] = text.split(" ");

        let textLine: string = "";
        for (const word of words) {
            const futureTextLine: string = `${textLine} ${word}`;
            if (futureTextLine.length <= textMaxLength) {
                textLine += " " + word;
                textLine = textLine.trim();
            } else {
                break;
            }
        }

        const lastChar = textLine.slice(-1);
        const removedChars: string[] = [",", "|", "&", "$", "@"];
        if (removedChars.includes(lastChar)) {
            textLine = textLine.slice(0, -1).trim();
        }

        return textLine + dots;
    }

    public static removeCharFromEnd(text: string, numberOfRemovedChars: number, dotWithSpace: boolean = true) {
        const dots: string = dotWithSpace ? " ..." : "...";
        const croppedText: string = text.slice(0, -Math.abs(numberOfRemovedChars + dots.length));

        if (!dotWithSpace) {
            return croppedText.trim() + dots;
        } else {
            return croppedText + dots;
        }
    }

    public static createFolderIfNotExist(folder: string): void {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }

    public static removeAllFilesInFolder(folder: string, except: string[] = null) {
        fs.readdir(folder, (err: Error, files: string[]) => {
            if (err) {
                logger.error(`Can not read files from the directory: ${folder}. ${err.message}`);
            } else {
                for (const file of files) {
                    const path: string = joinPath.join(folder, file);
                    if (except === null) {
                        fs.unlinkSync(path);
                    } else {
                        const fileNameParts: string[]  = file.split(".");
                        if (!except.includes(fileNameParts[fileNameParts.length - 1])) {
                            fs.unlinkSync(path);
                        }
                    }
                }
            }
        });
    }
}

export default SnippetUtils;
