module.exports = {
    plugins: [
        "@babel/plugin-syntax-dynamic-import"
    ],
    // presets: [
    //     '@vue/app',
    // ],
    env: {
        test: {
            presets: [['@babel/preset-env', { "targets": { "node": "current" }}]],
        },
    },
}
