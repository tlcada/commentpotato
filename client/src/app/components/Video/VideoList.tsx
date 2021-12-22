import React from 'react';

import { useTranslation } from "react-i18next";
import { makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import {
    Card,
    Link,
    CardContent,
    CardMedia,
    Avatar,
    Grid,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Collapse,
    Button,
    Divider,
    CircularProgress,
    FormControlLabel,
    Switch,
} from "@material-ui/core";
import { ThumbUp } from '@material-ui/icons';
import { useAsync } from 'react-async-hook';
import { TFunction } from "i18next";
import { ClassNameMap } from "@material-ui/styles";
import ReactPlayer from "react-player";

import sadFace from "../../../assets/img/sad-face.png";
import SnippetUtils from "../../utils/SnippetUtils";
import config from "../../../config/config";
import { get } from "../../api/call";
import { production } from "../../../environment/profile";
import { grey, indigo } from "@material-ui/core/colors";

const nl2br: any = require('react-newline-to-break');

interface VideoResponse {
    video: {
        videoId: string,
        shortVideoDescription: string,
        keyword: string,
        likeCount: number,
        dislikeCount: number,
        viewCount: number,
        commentCount: number,
        thumbnailUrl: {
            mediumResolution: string,
            highResolution: string,
            standardResolution: string,
            maxResolution: string
        },
        title: string,
        channelTitle: string,
        channelId: string,
        publishedAt: string,
    },
    comment: {
        authorDisplayName: string,
        authorChannelUrl: string,
        comment: string,
        likeCount: number,
        publishedAt: string,
        authorProfileImageUrl: string,
        totalReplyCount: number,
    },
    hashtags: Array<string>
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1
    },
    card: {
        maxWidth: "100%",
        marginTop: -90,
        marginBottom: 130,
        marginLeft: 20,
        marginRight: 20,
        minHeight: 585,
        [theme.breakpoints.down('xs')]: {
            height: "100%",
            minHeight: "100%"
        },
        [theme.breakpoints.down('md')]: {
            marginBottom: 70,
            marginTop: -50,
        },
    },
    videoMedia: {
        marginBottom: 10,
        height: 230,
        [theme.breakpoints.down(1920)]: {
            height: 300,
        },
        [theme.breakpoints.down(1750)]: {
            height: 275,
        },
        [theme.breakpoints.down(1550)]: {
            height: 250,
        },
        [theme.breakpoints.down(1400)]: {
            height: 240,
        },
        [theme.breakpoints.down(1280)]: {
            height: 300,
        },
        [theme.breakpoints.down(1150)]: {
            height: 275,
        },
        [theme.breakpoints.down(1050)]: {
            height: 240,
        },
        [theme.breakpoints.down(960)]: {
            height: 465,
        },
        [theme.breakpoints.down(900)]: {
            height: 415,
        },
        [theme.breakpoints.down(800)]: {
            height: 375,
        },
        [theme.breakpoints.down(700)]: {
            height: 340,
        },
        [theme.breakpoints.down(600)]: {
            height: 280,
        },
        [theme.breakpoints.down(550)]: {
            height: 260,
        },
        [theme.breakpoints.down(500)]: {
            height: 225,
        },
        [theme.breakpoints.down(450)]: {
            height: 210,
        },
        [theme.breakpoints.down(425)]: {
            height: 190,
        },
        [theme.breakpoints.down(400)]: {
            height: 180,
        },
        [theme.breakpoints.down(385)]: {
            height: 170,
        },
        [theme.breakpoints.down(375)]: {
            height: 165,
        },
        [theme.breakpoints.down(350)]: {
            height: 150,
        },
    },
    imgMedia: {
        height: 0,
        paddingTop: '56.25%', // 16:9
        marginBottom: 10,
    },
    bestComment: {
        display: 'inline',
    },
    thumbUp: {
        marginLeft: 5,
        position: "absolute",
        marginTop: 3
    },
    cardActions: {
        marginLeft: 10,
        textAlign: "center",
        display: "block",
        margin: "0 auto"
    },
    showFullComment: {
        marginLeft: 67,
        fontSize: 14
    },
    cardContentDivider: {
        marginLeft: 25,
        marginRight: 25
    },
    cardContent: {
        marginLeft: 12,
        marginRight: 12
    },
    downloading: {
        minHeight: 250,
        width: "100%",
        textAlign: "center",
        padding: 125,
        [theme.breakpoints.down('xs')]: {
            paddingTop: 80,
            paddingLeft: 30,
            paddingRight: 30,
            paddingBottom: 80,
        },
    }
}));

const switchStyle = makeStyles({
    root: {
        float: "right",
        marginTop: -6,
        marginRight: 0
    },
});

const ShowImageSwitch = withStyles({
    switchBase: {
        color: grey[50],
        marginLeft: 2,
        '&$checked': {
            color: indigo[300],
        },
        '&$checked + $track': {
            backgroundColor: indigo[300],
        },
    },
    checked: {},
    track: {
        backgroundColor: grey[400],
    },
})(Switch);

const parseVideoResults = (videoResults: Array<VideoResponse>): Array<VideoResponse> => {
    return videoResults.filter((videoResult: VideoResponse) => {
        return videoResult != null;
    });
};

const CustomCardMedia = ({ showVideoPlayer, videoUrl, videoDetail }: { showVideoPlayer: boolean, videoUrl: string, videoDetail: VideoResponse }) => {
    const classes: Partial<ClassNameMap<any>> = useStyles();

    if (!showVideoPlayer) {
        return (
            <Link href={ videoUrl } rel="noreferrer" color="inherit" target="_blank">
                <CardMedia
                    className={ classes.imgMedia }
                    image={ videoDetail.video.thumbnailUrl.highResolution }
                    title={ videoDetail.video.title }
                />
            </Link>
        );
    } else {
        return (
            <div className={ classes.videoMedia }>
                <ReactPlayer height={ "100%" } width={ "100%" } url={ videoUrl } playing={ false } controls />
            </div>
        );
    }
};

const OwnCard = ({ videoDetail }: { videoDetail: VideoResponse }) => {
    const [expanded, setExpanded] = React.useState(false);
    const [showVideoPlayer, changeVideoPlayerStatus] = React.useState(false);

    const { t }: { t: TFunction } = useTranslation();
    const classes: Partial<ClassNameMap<any>> = useStyles();
    const classesSwitch = switchStyle();

    const videoUrl: string = `${config.youtube.videoUrl}${videoDetail.video.videoId}`;
    const commentDetails: { isCommentValid: boolean, comment: string } = SnippetUtils.reduceCommentSize(videoDetail.comment.comment, config.videoList.commentMaxLength, config.videoList.maxLineSpaceNumber);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const showVideoPlayerLabel: string = showVideoPlayer ? t('header.switchButton.videoOn') : t('header.switchButton.videoOff');

    return (
        <div>
            <Card className={ classes.card }>
                <CardContent>
                    <CustomCardMedia showVideoPlayer={ showVideoPlayer } videoUrl={ videoUrl } videoDetail={ videoDetail } />

                    <Link href={ videoUrl } rel="noreferrer" color="inherit" target="_blank">
                        <Typography variant="subtitle1" gutterBottom>
                            <b>{ videoDetail.video.title }</b>
                        </Typography>
                    </Link>

                    <List className={classes.root}>
                        <ListItem alignItems="flex-start">
                            <Link href={ videoDetail.comment.authorChannelUrl } rel="noreferrer" color="inherit" target="_blank">
                                <ListItemAvatar>
                                    <Avatar alt={ videoDetail.comment.authorDisplayName } src={ videoDetail.comment.authorProfileImageUrl } />
                                </ListItemAvatar>
                            </Link>

                            <ListItemText
                                primary={ <Link href={ videoDetail.comment.authorChannelUrl } rel="noreferrer" color="inherit" target="_blank">
                                    { videoDetail.comment.authorDisplayName }
                                </Link> }
                                secondary={
                                    <React.Fragment>
                                        <Typography
                                            component="span"
                                            variant="subtitle1"
                                            className={classes.bestComment}
                                            color="textSecondary"
                                        >

                                            <Link href={ videoUrl } underline="none" rel="noreferrer" color="inherit" target="_blank">
                                                { nl2br(commentDetails.comment) }
                                            </Link>

                                            <br />

                                            { SnippetUtils.addThousandsSeparators(videoDetail.comment.likeCount) } <ThumbUp className={classes.thumbUp} fontSize="small" />

                                            <FormControlLabel
                                                control={
                                                    <ShowImageSwitch
                                                        checked={ showVideoPlayer }
                                                        onChange={ () => changeVideoPlayerStatus(!showVideoPlayer) }
                                                        color="primary"
                                                    />
                                                }
                                                label={ showVideoPlayerLabel }
                                                classes={ classesSwitch }
                                            />
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                        </ListItem>
                        {
                            !commentDetails.isCommentValid && (
                                <Button size="small" className={classes.showFullComment} onClick={handleExpandClick} color="primary">
                                    { expanded ? t('videoList.hideFullComment') : t('videoList.viewFullComment') }
                                </Button>
                            )
                        }
                    </List>
                </CardContent>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Divider className={classes.cardContentDivider} />
                    <CardContent className={classes.cardContent}>
                        <Typography color="textSecondary" component="span" variant="subtitle1">
                            <Link href={ videoUrl } underline="none" rel="noreferrer" color="inherit" target="_blank">
                                { nl2br(videoDetail.comment.comment) }
                            </Link>
                        </Typography>
                    </CardContent>
                </Collapse>
            </Card>
        </div>
    );
};

const fetchYouTubeVideos: any = async () => {
    // Simulates a slow connection
    // await SnippetUtils.sleep(3000);
    let init: RequestInit;
    if (production) {
        init = { method: "GET", cache: "no-cache" };
    } else {
        init = { method: "GET", cache: "no-cache", headers: SnippetUtils.getAuthHeader(process.env.REACT_APP_SERVER_JWT) };
    }
    return await get(config.webPageJsonUrl, init);
};

const VideoList: React.ElementType = () => {
    const { t } = useTranslation();
    const classes = useStyles();
    const videos: any = useAsync(fetchYouTubeVideos, []);

    let parsedResults: Array<VideoResponse> = [];
    if (videos.result !== undefined) {
        parsedResults = parseVideoResults(videos.result);
    }

    const errorCondition: boolean = videos.error || parsedResults.length <= 0;

    return (
        <div className={classes.root}>
            <Grid container>
                { videos.loading && (
                    <div className={classes.downloading}>
                        <CircularProgress />
                        <Typography variant="h6" color="textSecondary">
                            { t('videoList.downloading') }
                        </Typography>
                    </div>
                )}

                { (!videos.loading && errorCondition) && (
                    <div className={classes.downloading}>
                        <img src={sadFace} style={{ width: 200, marginTop: -30 }} alt="" />
                        <Typography variant="h6" color="textSecondary">
                            { t('videoList.error.ohNo') }
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            { t('videoList.error.tryAgain') }
                        </Typography>
                    </div>
                )}

                { parsedResults && (
                    parsedResults.reverse().map((videosDetails: any, index: number) => {
                        return <Grid key={index} item xl={3} lg={4} md={6} sm={12} xs={12}>
                            <OwnCard videoDetail={videosDetails} />
                        </Grid>
                    })
                )}
            </Grid>
        </div>
    );
};

export default VideoList;