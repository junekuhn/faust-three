const path = require('path');
//const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
    },
    watch: true,
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
                test: /\.(png|svg|jpg|gif|glb|gltf|obj)$/,
                use: [
                  'file-loader',
              ],
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
//    plugins: [
//       new HtmlWebpackPlugin({
//        title: 'Development',
//      }), 
//    ],
};
