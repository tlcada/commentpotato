import React from 'react';

import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import { ClassNameMap } from "@material-ui/styles";
import { Typography, Divider, Fab, Tooltip, Link } from "@material-ui/core";
import { Twitter, Instagram, YouTube, Facebook } from "@material-ui/icons";

import tooltipStyles from "../../../assets/jss/tooltipStyles";
import pageLogo from "../../../assets/img/page-logo.png";

const useStyles: any = makeStyles((theme: Theme) => ({
    parallax: {
        minHeight: 350,
        backgroundColor: "#0D0D0D",
        color: "#F9F9F9",
        margin: 0,
        padding: 0,
        border: 0,
        display: "flex",
        flexGrow: 1,
    },
    container: {
        marginRight: "auto",
        marginLeft: "auto",
        padding: 30,
        justifyContent: "space-between",
    },
    pageLogo: {
        width: 150,
        display: "block",
        margin: "0 auto"
    },
    description: {
        marginTop: 30,
        maxWidth: theme.breakpoints.width('md')
    },
    stack: {
        marginTop: 5,
        maxWidth: theme.breakpoints.width('md')
    },
    divider: {
        border: "1px solid",
        marginTop: 35,
    },
    socialMediaButton: {
        margin: 5
    }
}));

const LightTooltip = withStyles(tooltipStyles)(Tooltip);

const Footer: React.FC = () => {
    const { t }: { t: TFunction } = useTranslation();
    const classes: Partial<ClassNameMap<any>> = useStyles();

    return (
        <div className={classes.parallax}>
            <div className={classes.container}>
                <img className={classes.pageLogo} src={pageLogo} alt="" />
                <Typography variant="body1" gutterBottom className={classes.description} align="center">
                    {t('footer.description', { nickname: t('general.nickname') })}
                </Typography>
                <Typography gutterBottom className={classes.description} align="center">
                    <LightTooltip title={t('header.socialMedia.youtube.title')}>
                        <Fab className={classes.socialMediaButton} href={t('header.socialMedia.youtube.link')} rel="noreferrer" target="_blank" color="primary" aria-label="YouTube">
                            <YouTube />
                        </Fab>
                    </LightTooltip>
                    
                    <LightTooltip title={t('header.socialMedia.twitter.title')}>
                        <Fab className={classes.socialMediaButton} href={t('header.socialMedia.twitter.link')} rel="noreferrer" target="_blank" color="primary" aria-label="Twitter">
                            <Twitter />
                        </Fab>
                    </LightTooltip>

                    <LightTooltip title={t('header.socialMedia.instagram.title')}>
                        <Fab className={classes.socialMediaButton} href={t('header.socialMedia.instagram.link')} rel="noreferrer" target="_blank" color="primary" aria-label="Instagram">
                            <Instagram />
                        </Fab>
                    </LightTooltip>

                    <LightTooltip title={t('header.socialMedia.facebook.title')}>
                        <Fab className={classes.socialMediaButton} href={t('header.socialMedia.facebook.link')} rel="noreferrer" target="_blank" color="primary" aria-label="Facebook">
                            <Facebook />
                        </Fab>
                    </LightTooltip>
                </Typography>
                <Divider className={classes.divider} light />
                <Typography variant="body1" gutterBottom className={classes.description} align="center">
                    &#169; {t('footer.copyright', { year: new Date().getFullYear(), nickname: t('general.nickname') })}
                </Typography>

                <Typography variant="body1" gutterBottom className={classes.stack} align="center">
                    <Link color="inherit" component={ RouterLink } to={ "/stack" }>
                        { t('footer.technicalDetails') }
                    </Link>
                </Typography>
            </div>
        </div>
    );
};

export default Footer;