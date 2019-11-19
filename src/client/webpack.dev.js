const merge = require('webpack-merge');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        app: ['webpack-hot-middleware/client'],
    },
    devServer: {
        contentBase: '../../dist/out-tsc/client',
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackHarddiskPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new BundleAnalyzerPlugin(),
    ]
});
