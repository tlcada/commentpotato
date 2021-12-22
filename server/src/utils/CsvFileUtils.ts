import * as parse from "csv-parse";
import * as fs from "fs";
import * as joinPath from "path";

import { CSVColumns } from "./CsvFileUtilsTypes";
import { production } from "../environment/profile";
import S3Utils from "./S3Utils";
import { SnippetUtils } from "./index";
import { GeneralAppSettings } from "../config/configTypes";

const csvWriter = require("csv-write-stream");
const s3: S3Utils = new S3Utils();

class CsvFileUtils {

    private readonly folder: string;

    constructor(folder: string) {
        SnippetUtils.createFolderIfNotExist(folder);
        this.folder = folder;
    }

    public async savePublishedVideoDetailsToFile(records: CSVColumns, appSettings: GeneralAppSettings): Promise<void> {
        const path: string = joinPath.join(this.folder, appSettings.csvFile.name);
        let writer;

        if (fs.existsSync(path)) {
            writer = csvWriter({ sendHeaders: false });
        } else {
            writer = csvWriter();
        }

        // Flag a = append on
        const writeStream: fs.WriteStream = fs.createWriteStream(path, { flags: "a" });
        // TODO MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unpipe listeners added. Use emitter.setMaxListeners() to increase limit
        writer.pipe(writeStream);
        writer.write(records);
        writer.end();

        if (production && appSettings.aws.s3.enabled) {
            await s3.savePublishedCsvToS3(this.folder, appSettings.csvFile.name, appSettings.aws.s3.bucketName);
        }
    }

    public isVideoAlreadyPublished(videoId: string, appSettings: GeneralAppSettings): Promise<boolean> | never {
        return new Promise((resolve, reject) => {
            const path: string = joinPath.join(this.folder, appSettings.csvFile.name);

            if (production && appSettings.aws.s3.enabled) {
                return resolve(s3.isVideoAlreadyPublished(path, videoId, appSettings.aws.s3.bucketName));
            }

            if (!fs.existsSync(path)) {
                return resolve(false);
            }

            let videoIsAlreadyPublished: boolean;
            const parser = parse({ from: 1, skip_empty_lines: true, trim: true });

            fs.createReadStream(path)
                .pipe(parser)
                .on("error", (err) => {
                    return reject(err);
                })
                .on("data", (csvRow) => {
                    // Do not override value again if it has already been changed
                    if (!videoIsAlreadyPublished) {
                        videoIsAlreadyPublished = csvRow[0] === videoId;
                    }
                })
                .on("end", () => {
                    return resolve(videoIsAlreadyPublished);
                });
        });
    }
}

export default CsvFileUtils;
