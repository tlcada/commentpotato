import * as jsonfile from "jsonfile";
import * as joinPath from "path";

import { RandomYouTubeVideoResponse } from "../handler/YouTubeTypes";
import { createLogger } from "../logger/logger";
import { production } from "../environment/profile";
import S3Utils from "./S3Utils";
import { SnippetUtils } from "./index";
import { GeneralAppSettings } from "../config/configTypes";

const logger = createLogger(module);
const s3: S3Utils = new S3Utils();

class JsonFileUtils {

    private readonly folder: string;

    constructor(folder: string) {
        SnippetUtils.createFolderIfNotExist(folder);
        this.folder = folder;
    }

    public async savePublishedVideoDetailsToFile(jsonObject: RandomYouTubeVideoResponse[], fileName: string, appSettings: GeneralAppSettings): Promise<void> {
        if (jsonObject.length > 0) {
            const path: string = joinPath.join(this.folder, fileName);
            if (production && appSettings.aws.s3.enabled) {
                s3.savePublishedJsonToS3(path, jsonObject, appSettings.aws.s3.bucketName, appSettings.aws.s3.publicAccess);
            } else {
                await jsonfile.writeFile(path, jsonObject);
            }
        } else {
            logger.warn(`Can not save JSON data to the ${fileName} file because jsonObject is empty.`);
        }
    }
}

export default JsonFileUtils;
