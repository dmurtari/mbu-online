const path = require('path')
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    parallel: false,
    outputDir: path.join(__dirname, '../../dist/client'),
    configureWebpack: {
        resolve: {
            modules: [
                path.resolve(__dirname, 'src')
            ],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
            }
        },
    },
    chainWebpack: config => {
        config.plugin('html')
            .tap(args => {
                args[0].template = path.join(__dirname, 'public/index.html');
                return args;
            })

        if (process.env.NODE_ENV !== 'production') {
            console.log('Adding HotModuleReplacementPlugin');

            config.entry('app')
                .add('webpack-hot-middleware/client')

            config.plugin('hot')
                .use(webpack.HotModuleReplacementPlugin);
        }

        if (process.env.NODE_ENV === 'production') {
            console.log('Adding BundleAnalyzerPlugin');

            config.plugin('bundle')
                .use(BundleAnalyzerPlugin);
        }
    }
}
