// Used to run tests

// Location: handler > assets > ...
const words = { medium: "medium-english-words.json", mixed: "mixed-english-words.json", long: "long-english-words.json" };

const testConfig: any = {
    dateFormat: {
        finnishTime: "dd.MM.yyyy hh:mm:ss",
    },
    fileFolders: {
        csvFolder: "csv_files",
        jsonFolder: "json_files",
    },
    canvas: {
        vertical: {
            height: 1350,
            width: 1080,
        },
        horizontal: {
            height: 720,
            width: 1280,
        },
    },
    apps: {
        twitter: {
            name: "twitter",
            inUse: true,
            aws: {
                s3: {
                    enabled: false,
                    bucketName: "not_exist_bucket",
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.long, words.medium],
                minVideoViews: 275000,
                minCommentLikeCount: 250,
                commentMaxLength: 800, // If you set "null" the test fails as it should be
                maxNumberOfHashtags: 7,
            },
            csvFile: {
                enabled: true,
                name: "twitter.csv",
            },
            cronSchedule: "",
            tweet: {
                disableTitle: true,
                useImageInsteadOfVideoPlayer: true,
                maxNumberOfHashtags: 4,
                hashtagsMaxLength: 50,
                titleLength: 35,
                images: {
                    folder: "twitter_image",
                    useCustomThumbnailImage: true,
                },
            },
        },
        instagram: {
            name: "instagram",
            inUse: true,
            aws: {
                s3: {
                    enabled: false,
                    bucketName: "not_exist_bucket",
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.long, words.medium],
                minVideoViews: 275000,
                minCommentLikeCount: 250,
                commentMaxLength: 800,
                maxNumberOfHashtags: 8,
            },
            csvFile: {
                enabled: true,
                name: "instagram.csv",
            },
            cronSchedule: "",
            images: {
                single: {
                    imageDetailsFile: "instagram_single.txt",
                    zipFileName: "instagram.zip",
                    folder: "instagram_single_file",
                },
                weekly: {
                    maxNumberOfImages: 5,
                    imageDetailsFile: "instagram_weekly.txt",
                    zipFileName: "instagram.zip",
                    folder: "instagram_weekly_file",
                },
            },
        },
        webpage: {
            name: "webpage",
            inUse: true,
            aws: {
                s3: {
                    enabled: false,
                    bucketName: "not_exist_bucket",
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.long, words.medium],
                minVideoViews: 275000,
                minCommentLikeCount: 250,
                commentMaxLength: 800,
                maxNumberOfHashtags: 0,
            },
            csvFile: {
                enabled: false,
                name: "webpage.csv",
            },
            jsonFile: {
                name: "webpage.json",
                maxJsonObjects: 16,
            },
            cronSchedule: "",
        },
        youTubeVideo: {
            name: "youTubeVideo",
            inUse: false,
            aws: {
                s3: {
                    enabled: false,
                    bucketName: "not_exist_bucket",
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.long, words.medium],
                minVideoViews: 275000,
                minCommentLikeCount: 250,
                commentMaxLength: 800,
                apiKey: process.env.YOUTUBE_API_KEY,
                maxNumberOfHashtags: 12,
            },
            csvFile: {
                enabled: false,
                name: "youTubeVideo.csv",
            },
            cronSchedule: "0 2 * * 7",
            videos: {
                maxNumberOfImages: 4,
                coverLoopTime: 6,
                transitionDuration: 1,
                folder: "youtube_video",
                format: "mp4",
                tagsPerVideo: 3,
                songs: [{
                    name: "Wholesome by Kevin MacLeod",
                    link: "https://incompetech.filmmusic.io/song/5050-wholesome",
                    license: "http://creativecommons.org/licenses/by/4.0/",
                    fileName: "wholesome-by-kevin-macleod-from-filmmusic-io.mp3",
                }],
                fileName: (episodeNumber: number) => `episode_${episodeNumber}`,
                episodeCounterFileName: "episode_counter.txt",
            },
        },
    },
};

export default testConfig;
