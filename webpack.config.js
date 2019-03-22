var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    main: './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[hash:6].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024 * 20,
            name: 'media/[name].[hash:6].[ext]'
          }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minChunks: 1,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          filename: 'js/vendor.[hash:6].js'
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'React App',
      favicon: './public/favicon.ico',
    }),
    new ExtractTextPlugin('css/style.[hash:6].css')
  ],
  devServer: {
    port: 8808,
    open: 'Google Chrome',
    hot: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
};
