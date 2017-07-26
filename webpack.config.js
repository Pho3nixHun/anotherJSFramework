'use strict';

const path = require('path');

module.exports = {
    module: {
        rules: [
            { test: /\.(html)$/, use: ['html-loader'] }
        ]
    },
    entry: './src/app/boot.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};