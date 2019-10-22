const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env, _argv) {
    const isProduction = env && env.production;

    return {
        mode: isProduction ? 'production' : 'development',
        entry: {
            app: ['react-hot-loader/patch', path.resolve(__dirname, 'app', 'index.tsx'), 'webpack-hot-middleware/client'],
            vendor: ['react', 'react-dom']
        },
        output: {
            path: path.resolve(__dirname, '../../dist/out-tsc/client'),
            filename: 'js/[name].bundle.js',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                },
            ]
        },
        devtool: isProduction ? 'source-maps' : 'eval',
        devServer: {
            contentBase: '../../dist/out-tsc/client'
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(__dirname, 'public', 'index.html')
            }),
            new webpack.HotModuleReplacementPlugin()
        ]
    }
}
