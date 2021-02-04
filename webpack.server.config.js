const path = require("path")
const nodeExternals = require('webpack-node-externals')


const config = {
    name: "server",
    entry: [path.join(__dirname, './server/server.js')],
    target: "node",
    devtool: false,
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: "server.generated.js",
        // publicPath: '/dist/',
        libraryTarget: "commonjs2"
    },
    externals: [nodeExternals()], //ignores the node_modules folder from bundling and creating errors
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
}

module.exports = config