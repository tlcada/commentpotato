import React, { Component } from "react";
import ReactGA from "react-ga";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline, Container } from "@material-ui/core";
import CookieConsent from "react-cookie-consent";
import { withTranslation, WithTranslation } from "react-i18next";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import historyUtils from "./utils/historyUtils";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { VideoList } from './components/Video';
import { Architecture } from './components/Architecture';

ReactGA.initialize(process.env.REACT_APP_GA_CODE);

historyUtils.listen((location: any) => {
    ReactGA.set({ page: location.pathname });
    ReactGA.pageview(location.pathname);
});

const theme = createMuiTheme({
    palette: {
        type: "light"
    },
    spacing: 0,
    typography: {
        fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    backgroundColor: '#fcfcfc',
                }
            }
        }
    }
});

interface IComponentProps extends WithTranslation {}

class Main extends Component<IComponentProps> {

    componentDidMount() {
        ReactGA.pageview(window.location.pathname);
    }

    render() {
        return (
            <ThemeProvider theme={ theme }>
                <CssBaseline />
                <Router>
                    <Switch>
                        <Route exact path="/">
                            <Header />
                            <Container maxWidth="xl">
                                <VideoList />
                            </Container>
                            <Footer />
                        </Route>
                        <Route exact path="/stack">
                            <Container maxWidth="md">
                                <Architecture />
                            </Container>
                        </Route>
                        <Redirect to="/" />
                    </Switch>
                </Router>
                <CookieConsent buttonText={ this.props.t('cookieBanner.button') }>
                    { this.props.t('cookieBanner.text') }
                </CookieConsent>
            </ThemeProvider>
        );
    }
}

export default withTranslation()(Main);
