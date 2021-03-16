const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
    },
    devtool: 'inline-source-map',
    devServer: {
       contentBase: path.join(__dirname, 'dist'),
       compress: true,
       port: 9000
    },
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif|glb|gltf|hdr|obj)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    },
                },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            }
      ],
    },
   plugins: [
      new CopyPlugin({
      patterns: [
        { from: "./src/models/gltf", to: "./models/gltf/[name][ext]" },
        { from: "./src/textures", to: "./textures/[name][ext]" },
        { from: "./src/css", to: "./[name][ext]" },
      ],
    }),
   ],
};
