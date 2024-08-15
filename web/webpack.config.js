import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import NodemonPlugin from 'nodemon-webpack-plugin';

export default {
    entry: {
        home: './src/js/home.js',
        profile: './src/js/profile.js',
    },
    output: {
        filename: 'js/[name].min.js',
        path: path.resolve(import.meta.dirname, './public/'),
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                    mangle: true,
                },
            }),
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        "default",
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
        ],
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.(png|jpg|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/generated/[hash][ext][query]'
                }
            }
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].min.css',
        }),
        new NodemonPlugin({
            watch: import.meta.dirname + '/',
            ignore: [
                '**/node_modules/**',
                '**/src/**',
                '**/public/**',
            ],
            script: import.meta.dirname + '/app.js',
            nodeArgs: ['--inspect=0.0.0.0:9229'],
            ext: 'html, js, json',
        }),
    ],
    watch: process.env.NODE_ENV !== 'production',
    watchOptions: {
        ignored: ['**/node_modules'],
    },
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
