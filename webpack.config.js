const path = require('path');

module.exports = {
    mode: 'development',
    // devtool: "source-map",
    entry: './src/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '',
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.worker\.ts$/i,
                loader: "worker-loader",
            },
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
        ],
    },
};
