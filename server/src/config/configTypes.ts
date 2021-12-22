import { DataSource } from "../handler/YouTubeHandler";

export interface ForbiddenWords {
    bucketName: string;
    path: string;
}

export interface TheConfig {
    readonly port: number;
    readonly devModeDataSource: DataSource;
    readonly startHandlersInDevMode: {
        readonly instagram: boolean;
        readonly twitter: boolean;
        readonly webpage: boolean;
        readonly youtubeVideo: boolean;
    };
    languageDetection: {
        apiUrl: string;
    };
    dateFormat: {
        finnishTime: string;
    };
    logs: {
        cloudWatch: {
            logGroupName: string;
            logStreamName: string;
            awsRegion: string;
        },
        local: {
            filename: string;
            dirname: string;
            datePattern: string;
            maxSize: string;
            maxFiles: string;
        },
    };
    fileFolders: {
        csvFolder: string;
        jsonFolder: string;
    };
    youtube: {
        maxApiQueryAtTime: number;
        apiUrl: string;
        commentLanguage: string;
        aws: {
            forbiddenWords: ForbiddenWords,
            forbiddenChannels: ForbiddenWords,
        },
        queryParameters: {
            searchQuery: (randomWord: string, apiKey: string) => {
                part: string;
                type: string;
                maxResults: string;
                order: string;
                relevanceLanguage: string;
                key: string;
                safeSearch: string;
                videoDefinition: string;
                regionCode: string;
                q: string;
            },
            videoQuery: (videoId: string, apiKey: string) => {
                part: string;
                key: string;
                regionCode: string;
                id: string;
            },
            commentsQuery: (videoId: string, apiKey: string) => {
                part: string;
                key: string;
                videoId: string;
                maxResults: string;
                order: string;
                textFormat: string;
            },
            videoTags: (videoId: string, apiKey: string) => {
                part: string;
                key: string;
                regionCode: string;
                id: string;
            },
        },
    };
    canvas: {
        vertical: {
            height: number;
            width: number;
        },
        horizontal: {
            height: number;
            width: number;
        },
    }
    apps: {
        twitter: TwitterAppSettings;
        instagram: InstagramAppSettings;
        webpage: WebpageAppSettings;
        youTubeVideo: YouTubeVideoSettings;
    };
}

export interface DynamicAppType {
    [key: string]: TwitterAppSettings | InstagramAppSettings | WebpageAppSettings | YouTubeVideoSettings;
}

export interface GeneralAppSettings {
    name: string;
    inUse: boolean;
    aws: {
        s3: {
            enabled: boolean;
            bucketName: string;
            publicAccess: boolean;
        };
    };
    youtube: {
        wordLists: string[];
        minVideoViews: number;
        minCommentLikeCount: number;
        commentMaxLength: number;
        apiKey: string;
        maxNumberOfHashtags: number;
    };
    csvFile: {
        enabled: boolean;
        name: string;
    };
    cronSchedule: string;
}

export interface InstagramAppSettings extends GeneralAppSettings {
    images: {
        single: {
            imageDetailsFile: string;
            zipFileName: string;
            folder: string;
        };
        weekly: {
            maxNumberOfImages: number;
            imageDetailsFile: string;
            zipFileName: string;
            folder: string;
        };
    };
}

export interface TwitterAppSettings extends GeneralAppSettings {
    tweet: {
        disableTitle: boolean;
        useImageInsteadOfVideoPlayer: boolean;
        maxNumberOfHashtags: number;
        hashtagsMaxLength: number;
        titleLength: number;
        images: {
            folder: string;
            useCustomThumbnailImage: boolean;
        }
    };
}

export interface WebpageAppSettings extends GeneralAppSettings {
    jsonFile: {
        name: string;
        maxJsonObjects: number;
    };
}

export interface YouTubeVideoSongs {
    name: string;
    link: string;
    license: string;
    fileName: string;
}

export interface YouTubeVideoSettings extends GeneralAppSettings {
    videos: {
        maxNumberOfImages: number;
        coverLoopTime: number;
        transitionDuration: number;
        folder: string;
        format: string;
        tagsPerVideo: number;
        songs: YouTubeVideoSongs[],
        fileName: (episodeNumber: number) => string;
        episodeCounterFileName: string;
    };
}
