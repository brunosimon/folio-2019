const webpackMerge = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const path = require('path')


commonConfiguration.output = {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
}

module.exports = webpackMerge(
    commonConfiguration,
    {
        mode: 'development',
        devServer:
        {
            contentBase: './dist',
            writeToDisk: true,
            open: true
        },
        // watchOptions: {

        // }
    }
)
