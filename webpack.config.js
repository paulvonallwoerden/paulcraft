const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

/**
 * @type import('webpack').Configuration
 */
module.exports = {
    mode: 'development',
    entry: './src/main.ts',
    devtool: 'source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        modules: ["node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.worker\.ts$/i,
                loader: "worker-loader",
                options: {
                    filename: "[name].[contenthash].worker.js",
                },
            },
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "public" },
            ],
        }),
    ]
};
