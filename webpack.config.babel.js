const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

import Config from './src/js/config.js';

const isProduction = process.env.NODE_ENV === 'prod';

const plugins = [
    new ExtractTextPlugin({
        filename: 'all.css'
    }),
    new webpack.DefinePlugin({
        IS_PRODUCTION: JSON.stringify(isProduction)
    })

];

if (isProduction) {
    plugins.push(...[
        new UglifyJsPlugin({
            sourceMap: true
        })
    ]);
} else {
    plugins.push(...[
        new BrowserSyncPlugin({
            port: 3000,
            server: {
                baseDir: './'
            },
            // https: true,
            ghostMode: false,
            notify: false,
            scrollProportionally: false,
            cors: true
        })
    ]);
}

module.exports = {
    entry: {
        js: './src/js/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'all.js',
        library: Config.name,
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            'env'
                        ],
                        plugins: ['transform-object-assign']
                    }
                }
            },
            {
                test: /\.styl$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                            loader: 'css-loader',
                            options: {
                                url: false,
                                minimize: isProduction
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'stylus-loader'
                        }
                    ]
                })
            },
            {
                test: /\.json$/,
                exclude: /node_modules/
            }
        ]
    },
    watch: !isProduction,
    stats: {
        modules: false,
        hash: false,
        version: false
    },
    devtool: !isProduction ? 'source-map' : false,
    plugins,
    resolve: {
        modules: ['node_modules'],
        alias: {
            'TweenLite': 'gsap/src/minified/TweenLite.min.js',
            'TweenMax': 'gsap/src/minified/TweenMax.min.js',
            'TimelineLite': 'gsap/src/minified/TimelineLite.min.js',
            'TimelineMax': 'gsap/src/minified/TimelineMax.min.js',
            'ScrollMagic': 'scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
            'animation.gsap': 'scrollmagic/scrollmagic/minified/plugins/animation.gsap.min.js',
            'debug.addIndicators': 'scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min.js'
        }
    }
};