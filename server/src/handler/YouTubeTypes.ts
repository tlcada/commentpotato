interface Thumbnails {
    url: string;
    width: number;
    height: number;
}

interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}

interface SearchResponse {
    kind: string;
    etag: string;
    nextPageToken: string;
    regionCode: string;
    pageInfo: PageInfo;
    items: SearchResponseItem[];
}

interface SearchResponseItem {
    kind: string;
    etag: string;
    id: {
        kind: string;
        videoId: string;
    };
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: Thumbnails;
            medium: Thumbnails;
            high: Thumbnails;
        };
        channelTitle: string;
        liveBroadcastContent: string;
    };
}

interface VideoStatisticsResponse {
    kind: string;
    etag: string;
    pageInfo: PageInfo;
    items: Array<{
        kind: string;
        etag: string;
        id: string;
        statistics: VideoStatistics;
    }>;
}

interface VideoStatistics {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
}

interface VideoStatisticsCasted {
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
}

interface ParsedVideoDetailsReturn {
    videoId: string;
    keyword: string;
}

interface VideoCommentsResponse {
    kind: string;
    etag: string;
    nextPageToken: string;
    pageInfo: PageInfo;
    items: VideoCommentsItems[];
}

interface VideoCommentsItems {
    kind: string;
    etag: string;
    id: string;
    snippet: {
        videoId: string;
        topLevelComment: {
            kind: string;
            etag: string;
            id: string;
            snippet: VideoCommentsSnippet;
        };
        canReply: boolean;
        totalReplyCount: number;
        isPublic: boolean;
    };
}

interface VideoCommentsSnippet {
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: {
        value: string;
    };
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
}

interface ParsedComment {
    authorDisplayName: string;
    authorChannelUrl: string;
    comment: string;
    likeCount: number;
    publishedAt: string;
    authorProfileImageUrl: string;
    totalReplyCount: number;
}

interface ErrorResponse {
    error: {
        errors: Array<{
            domain: string;
            reason: string;
            message: string;
            locationType: string;
            location: string;
        }>;
        code: number;
        message: string;
    };
}

interface LanguageDetection {
    data: {
        detections: Array<{
            language: string;
            isReliable: boolean;
            confidence: number;
        }>;
    };
}

interface RandomYouTubeVideoResponse {
    video: {
        thumbnailUrl: VideoSnippetThumbnailUrl;
        title: string;
        channelTitle: string;
        publishedAt: string;
        channelId: string;
    } & ParsedVideoDetailsReturn & VideoStatisticsCasted;
    comment: ParsedComment;
    hashtags: string[];
    originalTags: string[];
}

interface VideoSnippet {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
        default?: Thumbnails;
        medium?: Thumbnails;
        high?: Thumbnails;
        standard?: Thumbnails;
        maxres?: Thumbnails;
    };
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
        title: string;
        description: string;
    };
    defaultAudioLanguage: string;
}

interface VideoSnippetResponse {
    kind: string;
    etag: string;
    pageInfo: PageInfo;
    items: Array<{
        kind: string;
        etag: string;
        id: string;
        snippet: VideoSnippet;
    }>;
}

interface VideoSnippetThumbnailUrl {
    mediumResolution: string;
    highResolution: string;
    standardResolution: string;
    maxResolution: string;
}

interface VideoSnippetReturn {
    thumbnailUrl: VideoSnippetThumbnailUrl;
    title: string;
    channelTitle: string;
    hashTags: string[];
    originalTags: string[];
    publishedAt: string;
    channelId: string;
}

export {
    SearchResponse,
    SearchResponseItem,
    VideoStatisticsResponse,
    VideoStatistics,
    ParsedVideoDetailsReturn,
    VideoCommentsResponse,
    VideoCommentsItems,
    VideoCommentsSnippet,
    ErrorResponse,
    LanguageDetection,
    ParsedComment,
    RandomYouTubeVideoResponse,
    VideoStatisticsCasted,
    VideoSnippet,
    VideoSnippetResponse,
    VideoSnippetReturn,
    VideoSnippetThumbnailUrl,
    Thumbnails,
};
