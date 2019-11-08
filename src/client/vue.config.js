const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    parallel: false,
    configureWebpack: {
        resolve: {
            modules: [
                path.resolve(__dirname, 'src'),
                'node_modules'
            ],
            alias: {
                'vue$': 'vue/dist/vue.esm.js',
            }
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: path.join(__dirname, 'public'),
                to: path.join(__dirname, 'dist'),
                toType: 'dir',
                ignore: ['index.html', '.DS_Store']
            }])
        ]
    },
    chainWebpack: config => {
        config.plugin('html')
            .tap(args => {
                args[0].template = path.join(__dirname, 'public/index.html');
                return args;
            })
    }
}
