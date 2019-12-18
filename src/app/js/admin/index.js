import 'babel-polyfill';
import 'url-api-polyfill';

import React from 'react';
import { render } from 'react-dom';
import { createHashHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import rootReducer from './reducers';
import Routes from './Routes';
import sagas from './sagas';
import configureStore from '../configureStore';
import scrollToTop from '../lib/scrollToTop';
import phrasesFor from '../i18n/translations';
import getLocale from '../../../common/getLocale';
import customTheme from '../public/customTheme';

const muiTheme = createMuiTheme(customTheme);

const locale = getLocale();
const initialState = {
    polyglot: {
        locale,
        phrases: phrasesFor(locale),
    },
};

const history = createHashHistory();
const store = configureStore(
    rootReducer,
    sagas,
    window.__PRELOADED_STATE__ || initialState,
    history,
);

render(
    <Provider {...{ store }}>
        <MuiThemeProvider theme={muiTheme}>
            <ConnectedRouter history={history} onUpdate={scrollToTop}>
                <Routes />
            </ConnectedRouter>
        </MuiThemeProvider>
    </Provider>,
    document.getElementById('root'),
);
