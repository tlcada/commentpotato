import { TheConfig } from "./configTypes";
import { production, test, videoModeOn } from "../environment/profile";

// Use lower values in development mode because of the dummy data.
const getRightValue = (prodVal: any, devVal: any) => {
    return (production || test || videoModeOn) ? prodVal : devVal;
};

const awsS3ServesClientSide = "commentpotato";
const awsS3ServesServerSide = "elasticbeanstalk-eu-north-1-commentpotato";

// Location: handler > assets > ...
const words = { medium: "medium-english-words.json", mixed: "mixed-english-words.json", long: "long-english-words.json" };

const config: TheConfig = {
    port: 3000,
    devModeDataSource: 0, // (Why DataSource.VALID_DUMMY_DATA not work?) This not override videoModeOn ENV variable,
    startHandlersInDevMode: {
        instagram: true,
        twitter: false,
        webpage: false,
        youtubeVideo: false,
    },
    languageDetection: {
        apiUrl: "https://ws.detectlanguage.com/0.2/detect",
    },
    dateFormat: {
        finnishTime: "dd.MM.yyyy hh:mm:ss",
    },
    logs: {
        cloudWatch: {
            logGroupName: awsS3ServesClientSide,
            logStreamName: "server",
            awsRegion: "eu-north-1",
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
        maxApiQueryAtTime: 9, // Recursion limit
        apiUrl: "https://www.googleapis.com/youtube/v3",
        commentLanguage: "en", // Comment language must be in English.
        aws: {
            forbiddenWords: {
                bucketName: awsS3ServesServerSide,
                path: "forbidden_words/words.txt",
            },
            forbiddenChannels: {
                bucketName: awsS3ServesServerSide,
                path: "forbidden_words/channels.txt",
            },
        },
        queryParameters: {
            searchQuery: (randomWord: string, apiKey: string) => {
                return {
                    part: "snippet",
                    type: "video",
                    maxResults: "15",
                    order: "viewCount",
                    relevanceLanguage: "en",
                    key: apiKey,
                    safeSearch: "strict",
                    videoDefinition: "high",
                    regionCode: "fi",
                    q: randomWord,
                };
            },
            videoQuery: (videoId: string, apiKey: string) => {
                return {
                    part: "statistics",
                    key: apiKey,
                    regionCode: "fi",
                    id: videoId,
                };
            },
            commentsQuery: (videoId: string, apiKey: string) => {
                return {
                    part: "snippet",
                    key: apiKey,
                    videoId,
                    maxResults: "2",
                    order: "relevance",
                    textFormat: "html",
                };
            },
            videoTags: (videoId: string, apiKey: string) => {
                return {
                    part: "snippet",
                    key: apiKey,
                    regionCode: "fi",
                    id: videoId,
                };
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
                    bucketName: awsS3ServesServerSide,
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.medium, words.mixed],
                minVideoViews: 275000,
                minCommentLikeCount: getRightValue(750, 50),
                commentMaxLength: getRightValue(null, 800),
                apiKey: process.env.YOUTUBE_API_KEY,
                maxNumberOfHashtags: 7,
            },
            csvFile: {
                enabled: true,
                name: "twitter.csv",
            },
            cronSchedule: "0 5 * * 0-6",
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
                    enabled: true,
                    bucketName: awsS3ServesServerSide,
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.medium, words.mixed],
                minVideoViews: 275000,
                minCommentLikeCount: getRightValue(450, 100),
                commentMaxLength: getRightValue(125, 800),
                apiKey: process.env.YOUTUBE_API_KEY,
                maxNumberOfHashtags: 8,
            },
            csvFile: {
                enabled: true,
                name: "instagram.csv",
            },
            cronSchedule: "0 5 * * 0-6",
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
        },
        webpage: {
            name: "webpage",
            inUse: true,
            aws: {
                s3: {
                    enabled: true,
                    bucketName: awsS3ServesClientSide,
                    publicAccess: true,
                },
            },
            youtube: {
                wordLists: [words.medium, words.long, words.mixed],
                minVideoViews: 275000,
                minCommentLikeCount: getRightValue(550, 100),
                commentMaxLength: getRightValue(135, 800),
                apiKey: process.env.YOUTUBE_API_KEY,
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
            cronSchedule: "0 1 * * 0-6",
        },
        youTubeVideo: {
            name: "youTubeVideo",
            inUse: false,
            aws: {
                s3: {
                    enabled: true,
                    bucketName: awsS3ServesServerSide,
                    publicAccess: false,
                },
            },
            youtube: {
                wordLists: [words.medium, words.mixed],
                minVideoViews: 225000,
                minCommentLikeCount: getRightValue(750, 100),
                commentMaxLength: getRightValue(155, 800), // If you change this, change it also to the CanvasBuilder.ts (line number about 110)
                apiKey: process.env.YOUTUBE_API_KEY,
                maxNumberOfHashtags: 12,
            },
            csvFile: {
                enabled: false,
                name: "youTubeVideo.csv",
            },
            cronSchedule: "0 0 1 1 *",
            videos: {
                maxNumberOfImages: getRightValue(9, videoModeOn ? 9 : 2), // Video mode on value must be the same as prod val
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
                fileName: (episodeNumber: number) => `episode_${episodeNumber}`,
                episodeCounterFileName: "episode_counter.txt",
            },
        },
    },
};

export default config;
