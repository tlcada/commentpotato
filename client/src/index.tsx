import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';

import './i18n';
import Main from './app/Main';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Main />, document.getElementById('root'));
// Use register() if you want your app to work offline and load faster.
// Note this comes with some pitfalls.
serviceWorker.register();
