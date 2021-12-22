interface CSVColumns {
    videoId: string;
    publishedAt: string;
    title: string;
    thumbnailMediumResolution: string;
    thumbnailHighResolution: string;
    thumbnailStandardResolution: string;
    thumbnailMaxResolution: string;
    channelTitle: string;
    channelId: string;
    viewCount: number;
    videoLikeCount: number;
    dislikeCount: number;
    commentCount: number;
    authorDisplayName: string;
    authorChannelUrl: string;
    comment: string;
    commentLikeCount: number;
    commentPublishedAt: string;
    authorProfileImageUrl: string;
    totalReplyCount: number;
    hashtags: string[];
    releaseTime: string;
    keyword: string;
    originalTags: string[];
}

export { CSVColumns };
