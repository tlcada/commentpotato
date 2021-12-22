import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import * as joinPath from "path";

import { SnippetUtils } from "../utils";
import { RandomYouTubeVideoResponse, VideoSnippetThumbnailUrl } from "../handler/YouTubeTypes";
import { createLogger } from "../logger/logger";
import config from "../config/config";
import { development, videoModeOn } from "../environment/profile";

const logger = createLogger(module);

class CanvasBuilder {

    private readonly theme: string = "light";
    private readonly folder: string;
    private readonly useBlackTheme: boolean;
    private readonly useLinuxFriendlyFileName: boolean;

    // Fonts
    private readonly fontName: string = "Roboto";
    private readonly fontSize: string = "50px";

    // Colors
    private readonly canvasBackgroundColor: string = "#f9f9f9";
    private readonly cardBackgroundColor: string = "#ffffff";
    private readonly titleMainColor: string = "#212121";
    private readonly commentTextColor: string = "#987575";
    private readonly thumbsUpColor: string = "#757575";
    private readonly cardMainBorderColor: string = "#e6e6e6";
    private readonly cardBottomBorderColor: string = "#a5a5a5";

    constructor(folder: string, useBlackTheme: boolean, useLinuxFriendlyFileName: boolean = false) {
        SnippetUtils.createFolderIfNotExist(folder);
        this.folder = folder;
        this.useBlackTheme = useBlackTheme;
        this.useLinuxFriendlyFileName = useLinuxFriendlyFileName;

        if (useBlackTheme) {
            this.theme = "black";
            this.canvasBackgroundColor = "#121212";
            this.cardBackgroundColor = "#1d1d1d";
            this.titleMainColor = "#e7e7e7";
            this.commentTextColor = "#969696";
            this.thumbsUpColor = this.commentTextColor;
            this.cardMainBorderColor = "#262626";
            this.cardBottomBorderColor = "#262626";
        }
    }

    public async buildCanvasImage(youtubeVideo: RandomYouTubeVideoResponse, youtubeImageOn: boolean = false): Promise<string> {
        const thumbnailUrl: VideoSnippetThumbnailUrl = youtubeVideo.video.thumbnailUrl;

        const canvasWidth: number = youtubeImageOn ? config.canvas.horizontal.width : config.canvas.vertical.width;
        const canvasHeight: number = youtubeImageOn ? config.canvas.horizontal.height : config.canvas.vertical.height;
        const fontSize: string = youtubeImageOn ? "40px" : this.fontSize;
        const authorImageSize: number = youtubeImageOn ? 27 : 30;
        const heightCoefficient: number = youtubeImageOn ? 0.91 : 0.93;
        const titleMainColor: string = (youtubeImageOn && this.useBlackTheme) ? "#fefefe" : this.titleMainColor;
        let commentTextColor: string;
        if (youtubeImageOn && this.useBlackTheme) {
            commentTextColor = "#c8c8c8";
        } else if (youtubeImageOn && !this.useBlackTheme) {
            commentTextColor = "#ababab";
        } else {
            commentTextColor = this.commentTextColor;
        }

        let commentMaxLineNumber: number = youtubeImageOn ? 4 : 6;

        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext("2d");
        ctx.font = `bold ${fontSize} ${this.fontName}`;

        if (youtubeImageOn) {
            await this.drawImage(ctx, 0, 0, canvasWidth, canvasHeight, this.getThumbnailUrl(thumbnailUrl));
        } else {
            // Create background color
            ctx.fillStyle = (youtubeImageOn && !this.useBlackTheme) ? "#c8c8c8" : this.canvasBackgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        // Create the card
        const materialUiCardWidth: number = canvasWidth * 0.87;
        const materialUiCardHeight: number = canvasHeight * heightCoefficient;
        const materialUiCardX: number = (canvasWidth - materialUiCardWidth) / 2;
        const materialUiCardY: number = (canvasHeight - materialUiCardHeight) / 2;
        this.createMaterialUICard(ctx, materialUiCardX, materialUiCardY, materialUiCardWidth, materialUiCardHeight, 5, youtubeImageOn);

        const contentWidth: number = materialUiCardWidth * 0.92;
        const contentHeight: number = materialUiCardHeight * 0.95;
        const marginLeft: number = ((materialUiCardWidth - contentWidth) / 2) + materialUiCardX;
        const marginTop: number = ((materialUiCardHeight - contentHeight) / 2) + materialUiCardY;

        if (youtubeImageOn) {
            const miniImageWidth: number = materialUiCardWidth * 0.222;
            const miniImageHeight: number = materialUiCardHeight * 0.222;
            const miniImageX: number = (canvasWidth - materialUiCardX) - (miniImageWidth + 12);
            const miniImageY: number = (canvasHeight - materialUiCardY) - (miniImageHeight + 12);
            await this.drawImage(ctx, miniImageX, miniImageY, miniImageWidth, miniImageHeight, this.getThumbnailUrl(thumbnailUrl));
        }

        let textStartDy: number;
        if (youtubeImageOn) {
            textStartDy = marginTop * 2.13;
        } else {
            const imageHeight: number = contentWidth * 0.5;
            // Add "background image"
            await this.drawImage(ctx, marginLeft, marginTop, contentWidth, imageHeight, this.getThumbnailUrl(thumbnailUrl));
            textStartDy = (marginTop + imageHeight) * 1.13;
        }

        const indentedContentMargin: number =  marginLeft * 1.15;
        let textMaxWidth: number = contentWidth - indentedContentMargin;

        // Add title
        let theComment: string = youtubeVideo.comment.comment;
        if (development && !videoModeOn) {
            logger.info("Sliced comment in development mode");
            // Do this because of the dummy data. See config file.
            // Same as in YouTube prod conf.
            theComment = theComment.substring(0, 155);
        }

        const commentLines: string[] = this.separateTextToOwnLines(ctx, theComment, textMaxWidth, commentMaxLineNumber);
        const titleLinesNumber: number = (commentLines.length <= 4) ? 3 : 2;
        const titleLines: string[] = this.separateTextToOwnLines(ctx, youtubeVideo.video.title, contentWidth - 10, titleLinesNumber);
        let titleDy: number = this.addText(ctx, titleMainColor, marginLeft, textStartDy, youtubeVideo.video.title, contentWidth - 10, titleLinesNumber);

        // Change font
        ctx.font = `${fontSize} ${this.fontName}`;

        // Draw author icon
        await this.drawAuthorIcon(ctx, indentedContentMargin, titleDy + 10, authorImageSize, youtubeVideo.comment.authorProfileImageUrl);
        const contentTextMarginLeft = authorImageSize + indentedContentMargin + 130;
        textMaxWidth = (contentWidth - authorImageSize) - 170;

        // Add comment author name
        titleDy = this.addText(ctx, titleMainColor, contentTextMarginLeft, titleDy + 60, youtubeVideo.comment.authorDisplayName, textMaxWidth, 1);

        // The comment
        commentMaxLineNumber = (titleLines.length === 1) ? commentMaxLineNumber + 1 : commentMaxLineNumber;
        titleDy = this.addText(ctx, commentTextColor, contentTextMarginLeft, titleDy + 5, theComment, textMaxWidth, commentMaxLineNumber);

        // Comment likes
        const likeCount: string = `${SnippetUtils.addThousandsSeparators(youtubeVideo.comment.likeCount)}`;
        const likeCountExtraMargin: number = youtubeImageOn ? 33 : 43;
        this.addText(ctx, commentTextColor, contentTextMarginLeft, titleDy + likeCountExtraMargin, `${likeCount} likes`, textMaxWidth, 1);

        if (youtubeImageOn) {
            return await this.saveImage(canvas, youtubeVideo.video.videoId, "horizontal");
        }

        return await this.saveImage(canvas, youtubeVideo.video.videoId);
    }

    private getThumbnailUrl(thumbnailUrl: VideoSnippetThumbnailUrl): string {
        if (thumbnailUrl.maxResolution !== null) {
            return thumbnailUrl.maxResolution;
        } else {
            return thumbnailUrl.mediumResolution;
        }
    }

    private createMaterialUICard(ctx: any, x: number, y: number, width: number, height: number, radius: number, youtubeImageOn: boolean): void {
        const r = x + width;
        const b = y + height;

        ctx.beginPath();

        if (youtubeImageOn && this.useBlackTheme) {
            // Turn transparency on
            ctx.globalAlpha = 0.91;
        } else if (youtubeImageOn && !this.useBlackTheme) {
            // Turn transparency on
            ctx.globalAlpha = 0.84;
        }
        ctx.fillStyle = this.cardBackgroundColor;
        ctx.fillRect(x, y, width, height);

        const gradient = ctx.createLinearGradient(0, (height + y) - 1, 0, 0);
        gradient.addColorStop(0, this.cardBottomBorderColor);
        gradient.addColorStop(0, this.cardMainBorderColor);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;

        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);

        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + height - radius);

        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);

        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);

        ctx.quadraticCurveTo(x, y, x + radius, y);

        ctx.stroke();
    }

    private async drawImage(ctx: any, dx: number, dy: number, dWidth: number, dHeight: number, url: string): Promise<void> {
        const img = await loadImage(url);
        ctx.drawImage(img, dx, dy, dWidth, dHeight);
    }

    private addText(ctx: any, fontColor: string, dx: number, dy: number, text: string, textMaxWidth: number, maxLineNumber: number): number {
        const lines: string[] = this.separateTextToOwnLines(ctx, text, textMaxWidth, maxLineNumber);
        lines.forEach((line: string) => {
            ctx.fillStyle = fontColor;
            ctx.fillText(line, dx, dy);
            dy += 65;
        });

        return dy;
    }

    private separateTextToOwnLines(ctx: any, text: string, textMaxWidth: number, maxLineNumber: number): string[] {
        const lineBreak: string = "xJy80YBQrhpAXYgx";
        text = SnippetUtils.replaceLineBreakWithBr(text);
        text = text.replace(/<br\s*[\/]?>/gi, " " + lineBreak + " ");

        // If the final sentence is smaller than textMaxLengthPerLine it will not
        // be added to the array in the forEach loop, so we have to keep last status in the memory.
        let textIsInArray: boolean = false;
        let textLine: string = "";
        const textLines: string[] = [];

        let textLinesCounter: number = 0;
        text.split(" ").forEach((word: string) => {
            const futureTextLine: string = `${textLine} ${word}`;
            const measureText: any = ctx.measureText(futureTextLine);

            if (measureText.width > textMaxWidth) {
                textLinesCounter++;
                if (word !== lineBreak) {
                    textLine = word;
                    textIsInArray = false;
                } else {
                    textLine = "";
                    textIsInArray = true;
                }
            } else {
                if (word !== lineBreak) {
                    textLine += " " + word;
                    textLines[textLinesCounter] = textLine.trim();
                    textIsInArray = true;
                }
            }

            textLine = textLine.trim();
        });

        if (!textIsInArray) {
            textLines.push(textLine.trim());
        }

        const finalTextLines = textLines.slice(0, maxLineNumber);

        if (textLines.length > maxLineNumber) {
            const lastSentence: string = finalTextLines[finalTextLines.length - 1];
            const lastSentenceArray: string[] = lastSentence.split(" ");
            lastSentenceArray[lastSentenceArray.length - 1] = "...";
            finalTextLines[finalTextLines.length - 1] = lastSentenceArray.join(" ");
        }

        return finalTextLines;
    }

    private async drawAuthorIcon(ctx: any, dx: number, dy: number, imageSize: number, url: string): Promise<void> {
        const img = await loadImage(url);
        ctx.save();
        ctx.beginPath();
        ctx.arc(2 * imageSize + dx, 2 * imageSize + dy, 2 * imageSize, 0, 2 * Math.PI, true);
        ctx.clip();
        ctx.drawImage(img, dx, dy, (4 * imageSize + 2), (4 * imageSize + 2));
        ctx.restore();
    }

    private saveImage(canvas: any, videoId: string, extraName: string = null): Promise<string> {
        return new Promise((resolve, reject) => {
            let fileName: string = `${videoId}_${this.theme}`;
            if (extraName !== null) {
                fileName = fileName + "_" + extraName;
            }

            if (this.useLinuxFriendlyFileName) {
                fileName = SnippetUtils.createLinuxFriendlyName(fileName);
            }

            fileName += ".png";
            fileName = fileName.toLowerCase();

            const out = fs.createWriteStream(joinPath.join(this.folder, fileName));
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            out.on("error", (err: Error) => {
                return reject(`Can not create canvas image. ${err.message}`);
            });
            out.on("finish", () => {
                out.end();
                return resolve(fileName);
            });
        });
    }
}

export default CanvasBuilder;
