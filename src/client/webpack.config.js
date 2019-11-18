const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = function (env, _argv) {
    const isProduction = env && env.production;

    return {
        mode: isProduction ? 'production' : 'development',
        entry: {
            app: [path.resolve(__dirname, 'src', 'main.js'), 'webpack-hot-middleware/client'],
        },
        output: {
            path: path.resolve(__dirname, '../../dist/out-tsc/client'),
            filename: 'js/[name].bundle.js',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.js', '.json', '.ts', '.css'],
            modules: [
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, '../../node_modules')
            ],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
                '@components': path.resolve(__dirname, 'src/components/'),
                '@store': path.resolve(__dirname, 'src/store/'),
                '@interfaces': path.resolve(__dirname, '../libs/interfaces'),
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.css$/i,
                    use: ['vue-style-loader', 'css-loader'],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: 'url-loader?limit=10000',
                },
                {
                    test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                    use: 'file-loader',
                },
                {
                    test: /\.vue$/i,
                    loader: 'vue-loader'
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    loader: 'source-map-loader'
                }
            ]
        },
        devtool: isProduction ? 'source-maps' : 'eval',
        devServer: {
            contentBase: '../../dist/out-tsc/client',
            historyApiFallback: true
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(__dirname, 'public', 'index.html'),
                alwaysWriteToDisk: true
            }),
            new HtmlWebpackHarddiskPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new VueLoaderPlugin(),
        ]
    }
}