import "mocha";
import { expect } from "chai";

import config from "../config";
import { DataSource } from "../../handler/YouTubeHandler";
delete config.youtube.queryParameters;
delete config.apps.youTubeVideo.videos.fileName;

describe("config.ts", () => {
    it("should match", () => {
        expect(config).to.have.deep.include({
            port: 3000,
            devModeDataSource: DataSource.VALID_DUMMY_DATA,
            startHandlersInDevMode: {
                instagram: true,
                twitter: false,
                webpage: false,
                youtubeVideo: false,
            },
            languageDetection: {
                apiUrl: 'https://ws.detectlanguage.com/0.2/detect'
            },
            dateFormat: {
                finnishTime: "dd.MM.yyyy hh:mm:ss",
            },
            logs: {
                cloudWatch: {
                    logGroupName: "commentpotato",
                    logStreamName: "server",
                    awsRegion: "eu-north-1"
                },
                local: {
                    filename: "%DATE%.log",
                    dirname: "logs",
                    datePattern: "yyyy-MM-dd",
                    maxSize: "20m",
                    maxFiles: "5",
                },
            },
            fileFolders: {
                csvFolder: "csv_files",
                jsonFolder: "json_files",
            },
            youtube: {
                maxApiQueryAtTime: 9,
                apiUrl: 'https://www.googleapis.com/youtube/v3',
                commentLanguage: 'en',
                aws: {
                    forbiddenWords: {
                        bucketName: "elasticbeanstalk-eu-north-1-commentpotato",
                        path: "forbidden_words/words.txt",
                    },
                    forbiddenChannels: {
                        bucketName: "elasticbeanstalk-eu-north-1-commentpotato",
                        path: "forbidden_words/channels.txt",
                    },
                },
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
                            enabled: true,
                            bucketName: "elasticbeanstalk-eu-north-1-commentpotato",
                            publicAccess: false,
                        },
                    },
                    youtube: {
                        wordLists: ["medium-english-words.json", "mixed-english-words.json"],
                        minVideoViews: 275000,
                        minCommentLikeCount: 750,
                        commentMaxLength: null,
                        apiKey: config.apps.twitter.youtube.apiKey,
                        maxNumberOfHashtags: 7,
                    },
                    csvFile: {
                        enabled: true,
                        name: "twitter.csv",
                    },
                    cronSchedule: '0 5 * * 0-6',
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
                    }
                },
                instagram: {
                    name: "instagram",
                    inUse: true,
                    aws: {
                        s3: {
                            enabled: true,
                            bucketName: "elasticbeanstalk-eu-north-1-commentpotato",
                            publicAccess: false,
                        },
                    },
                    youtube: {
                        wordLists: ["medium-english-words.json", "mixed-english-words.json"],
                        minVideoViews: 275000,
                        minCommentLikeCount: 450,
                        commentMaxLength: 125,
                        apiKey: config.apps.instagram.youtube.apiKey,
                        maxNumberOfHashtags: 8,
                    },
                    images: {
                        single: {
                            imageDetailsFile: "instagram_single.txt",
                            zipFileName: "instagram.zip",
                            folder: "instagram_single_file",
                        },
                        weekly: {
                            maxNumberOfImages: 30,
                            imageDetailsFile: "instagram_weekly.txt",
                            zipFileName: "instagram.zip",
                            folder: "instagram_weekly_file",
                        },
                    },
                    csvFile: {
                        enabled: true,
                        name: "instagram.csv",
                    },
                    cronSchedule: '0 5 * * 0-6'
                },
                webpage: {
                    name: "webpage",
                    inUse: true,
                    aws: {
                        s3: {
                            enabled: true,
                            bucketName: "commentpotato",
                            publicAccess: true,
                        },
                    },
                    youtube: {
                        wordLists: ["medium-english-words.json", "long-english-words.json", "mixed-english-words.json"],
                        minVideoViews: 275000,
                        minCommentLikeCount: 550,
                        commentMaxLength: 135,
                        apiKey: config.apps.webpage.youtube.apiKey,
                        maxNumberOfHashtags: 0,
                    },
                    csvFile: {
                        enabled: false,
                        name: "webpage.csv",
                    },
                    jsonFile: {
                        name: "webpage.json",
                        maxJsonObjects: 16
                    },
                    cronSchedule: '0 1 * * 0-6',
                },
                youTubeVideo: {
                    name: "youTubeVideo",
                    inUse: false,
                    aws: {
                        s3: {
                            enabled: true,
                            bucketName: "elasticbeanstalk-eu-north-1-commentpotato",
                            publicAccess: false,
                        },
                    },
                    youtube: {
                        wordLists: ["medium-english-words.json", "mixed-english-words.json"],
                        minVideoViews: 225000,
                        minCommentLikeCount: 750,
                        commentMaxLength: 155,
                        apiKey: config.apps.youTubeVideo.youtube.apiKey,
                        maxNumberOfHashtags: 12,
                    },
                    csvFile: {
                        enabled: false,
                        name: "youTubeVideo.csv",
                    },
                    cronSchedule: "0 0 1 1 *",
                    videos: {
                        maxNumberOfImages: 9,
                        coverLoopTime: 6,
                        transitionDuration: 1,
                        folder: "youtube_video",
                        format: "mp4",
                        tagsPerVideo: 3,
                        songs: [{ // https://incompetech.filmmusic.io/
                            name: "Wholesome by Kevin MacLeod",
                            link: "https://incompetech.filmmusic.io/song/5050-wholesome",
                            license: "http://creativecommons.org/licenses/by/4.0/",
                            fileName: "wholesome-by-kevin-macleod-from-filmmusic-io.mp3",
                        }, {
                            name: "The Path of the Goblin King by Kevin MacLeod",
                            link: "https://incompetech.filmmusic.io/song/4503-the-path-of-the-goblin-king",
                            license: "http://creativecommons.org/licenses/by/4.0/",
                            fileName: "the-path-of-the-goblin-king-by-kevin-macleod-from-filmmusic-io.mp3",
                        }, {
                            name: "Thatched Villagers by Kevin MacLeod",
                            link: "https://incompetech.filmmusic.io/song/4481-thatched-villagers",
                            license: "http://creativecommons.org/licenses/by/4.0/",
                            fileName: "thatched-villagers-by-kevin-macleod-from-filmmusic-io.mp3",
                        }, {
                            name: "I Can Feel it Coming by Kevin MacLeod",
                            link: "https://incompetech.filmmusic.io/song/3893-i-can-feel-it-coming",
                            license: "http://creativecommons.org/licenses/by/4.0/",
                            fileName: "i-can-feel-it-coming-by-kevin-macleod-from-filmmusic-io.mp3",
                        }],
                        episodeCounterFileName: "episode_counter.txt",
                    },
                },
            }
        });
    });
});
