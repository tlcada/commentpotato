import React from "react";

import { useTranslation } from "react-i18next";
import { makeStyles, withStyles, Theme } from "@material-ui/core/styles";
import {
    Toolbar,
    Button,
    Tooltip,
    Typography,
    AppBar,
} from "@material-ui/core";
import { Instagram, Twitter, YouTube, Facebook } from "@material-ui/icons";
import * as Scroll from 'react-scroll';
import { ClassNameMap } from "@material-ui/styles";
import { TFunction } from "i18next";

import tooltipStyles from "../../../assets/jss/tooltipStyles";
import pageLogo from "../../../assets/img/page-logo.png";

const useStyles: any = makeStyles((theme: Theme) => ({
    appBar: {
        backgroundColor: "transparent !important",
        border: 0,
        boxShadow: "none",
        paddingTop: 15
    },
    socialMediaBox: {
        marginRight: -10,
        [theme.breakpoints.down('xs')]: {
            marginRight: -20,
        }
    },
    socialMediaIcon: {
        color: theme.palette.common.white,
    },
    container: {
        marginRight: "auto",
        marginLeft: "auto",
        width: "100%",
        justifyContent: "space-between",
        [theme.breakpoints.up('xl')]: {
            maxWidth: theme.breakpoints.width('xl'),
        }
    },
    parallax: {
        height: 600,
        backgroundColor: "#0D0D0D",
        backgroundPosition: "center center",
        backgroundSize: "cover",
        color: "#F9F9F9",
        margin: 0,
        padding: 0,
        border: 0,
        display: "flex",
        alignItems: "center",
        [theme.breakpoints.down('md')]: {
            height: 450,
        }
    },
    pageLogo: {
        width: 350,
        marginTop: -80,
        display: "block",
        margin: "0 auto",
        [theme.breakpoints.down('md')]: {
            width: 240,
            marginTop: -20
        }
    },
    slogan: {
        fontSize: 26,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 10,
        [theme.breakpoints.down('md')]: {
            marginTop: 0,
            fontSize: 19,
        },
    },
    description: {
        marginTop: 45,
        [theme.breakpoints.down('md')]: {
            marginTop: 45,
            fontSize: 14,
        }
    },
    readMore: {
        marginTop: 15,
    }
}));

const LightTooltip = withStyles(tooltipStyles)(Tooltip);

const Header: React.ElementType = () => {
    const scroll = Scroll.animateScroll;

    const { t }: { t: TFunction } = useTranslation();
    const classes: Partial<ClassNameMap<any>> = useStyles();

    const scrollToBottom = () => {
        scroll.scrollToBottom();
    };

    return (
        <div>
            <AppBar className={classes.appBar} position="absolute">
                <Toolbar className={classes.container}>
                    <div>
                        <LightTooltip className={classes.socialMediaBox} title={t('header.socialMedia.youtube.title')}>
                            <Button color="primary" href={t('header.socialMedia.youtube.link')} rel="noreferrer" target="_blank">
                                <YouTube className={classes.socialMediaIcon} />
                            </Button>
                        </LightTooltip>

                        <LightTooltip className={classes.socialMediaBox} title={t('header.socialMedia.twitter.title')}>
                            <Button color="primary" href={t('header.socialMedia.twitter.link')} rel="noreferrer" target="_blank">
                                <Twitter className={classes.socialMediaIcon} />
                            </Button>
                        </LightTooltip>

                        <LightTooltip className={classes.socialMediaBox} title={t('header.socialMedia.instagram.title')}>
                            <Button color="primary" href={t('header.socialMedia.instagram.link')} rel="noreferrer" target="_blank">
                                <Instagram className={classes.socialMediaIcon} />
                            </Button>
                        </LightTooltip>

                        <LightTooltip className={classes.socialMediaBox} title={t('header.socialMedia.facebook.title')}>
                            <Button color="primary" href={t('header.socialMedia.facebook.link')} rel="noreferrer" target="_blank">
                                <Facebook className={classes.socialMediaIcon} />
                            </Button>
                        </LightTooltip>
                    </div>
                </Toolbar>
            </AppBar>

            <div className={classes.parallax}>
                <div className={classes.container}>
                    <img className={classes.pageLogo} src={pageLogo} alt="" />

                    <Typography align="center" className={classes.slogan} variant="h1">
                        {t('general.slogan')}.
                    </Typography>

                    <Typography align="center" className={classes.description} variant="body1">
                        {t('header.description')} <br /> {t('header.newVideo')}
                    </Typography>

                    <Typography align="center">
                        <Button className={classes.readMore} onClick={scrollToBottom} variant="contained" color="primary" size="small">
                            {t('header.readMore')}
                        </Button>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default Header;