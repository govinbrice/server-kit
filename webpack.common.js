
const path = require('path');

commonConfiguration = {
    // defaults to ./src, here the application starts executing and webpack starts bundling   
    entry: "./src/Server.ts",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "server-kit.js"
    },
    module: {
        "rules": [
            {
                "test": /\.(ts|tsx)$/,
                "use": {
                    "loader": "awesome-typescript-loader",
                }
            }
        ]
    },
    // enhance debugging by adding meta info for the browser devtools
    // source-map most detailed at the expense of build speed.
    devtool: "source-map",

    target: "node"
}

module.exports = commonConfiguration