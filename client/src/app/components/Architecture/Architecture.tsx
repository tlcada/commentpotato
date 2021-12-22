import React from "react";
import { makeStyles, Theme, Chip, Typography, Link } from "@material-ui/core";
import { ClassNameMap } from "@material-ui/styles";
import { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";

import success from './assets/success.png';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(0.5),
        },
        margin: 30,
    },
    chip: {
        margin: 5
    },
    title: {
        fontSize: 30,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 30,
    },
    manImg: {
        height: 450,
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: -20
    }
}));

export default () => {
    const classes: Partial<ClassNameMap<any>> = useStyles();
    const { t }: { t: TFunction } = useTranslation();

    const stacks: string[] = [
        "YouTube Data API",
        "Twitter API",
        "AWS Elastic Beanstalk",
        "Docker",
        "ZEIT",
        "TypeScript",
        "Create React App",
        "Node.js",
        "Koa.js",
        "Koa Router",
        "REST API",
        "Mocha",
        "AWS Route 53",
        "JWT",
        "AWS CloudWatch",
        "AWS ECR",
        "AWS S3",
        "Canvas",
        "FFmpeg",
        "i18next",
        "Chai",
        "Material-UI",
        "Jest",
        "Node Schedule"
    ];

    return (
        <React.Fragment>
            <Typography align="center" className={ classes.title } variant="h1">
                { t('stack.title') }
            </Typography>

            <Typography align="center" variant="subtitle1">
                { t('stack.subTitle') }
            </Typography>

            <div className={ classes.root }>
                {
                    stacks.map((stack) => {
                        return <Chip
                            size="medium"
                            className={ classes.chip }
                            label={ stack }
                            color="primary"
                        />
                    })
                }
            </div>

            <img src={ success } className={ classes.manImg } alt="Man" />

            <Typography align="center" variant="subtitle1" gutterBottom>
                <Link color='primary' component={ RouterLink } to={ "/" }>
                    { t('stack.backText') }
                </Link>
            </Typography>
        </React.Fragment>
    );
};
