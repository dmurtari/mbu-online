const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: {
        app: [path.resolve(__dirname, 'src', 'main.js')],
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
                test: /\.vue$/i,
                loader: 'vue-loader'
            },
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
                test: /\.scss$/i,
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
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(__dirname, 'public', 'index.html'),
            alwaysWriteToDisk: true
        }),
        new VueLoaderPlugin(),
    ]
}
