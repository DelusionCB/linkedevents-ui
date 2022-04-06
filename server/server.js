/* eslint-disable no-console */

import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'

import getSettings from './getSettings'
import express from 'express'
import compression from 'compression'
import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../config/webpack/dev.js'

const settings = getSettings()
const app = express()

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: 's', secret: settings.sessionSecret, maxAge: 86400 * 1000}));
// Apply compression to all responses
app.use(compression());

if(process.env.NODE_ENV !== 'development') {
    const distPath = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.use('*', express.static(distPath));
} else {
    const indexTemplate = require('./renderIndexTemplate');
    const compiler = webpack(config)
    app.use(webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {
            colors: true,
            assets: false,
            modules: false,
        },
    }));
    app.use(webpackHotMiddleware(compiler));
    app.get('*', (req, res) => {
        res.send(indexTemplate);
    });
}
console.log(`Starting ${process.env.NODE_ENV} server...`);
app.listen(settings.port, () => {
    console.log(`${process.env.NODE_ENV} server running on port ${settings.port}.`)
}).on('error', (e) => {
    console.error(e);
    throw new Error(e.code);
});
