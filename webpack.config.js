var path = require('path');
var webpack = webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var IS_PRODUCTION = process.env.NODE_ENV == 'production';

module.exports = {
  output: {
    path: path.resolve(__dirname, "build", "web"),
    filename: "[name].js",
    publicPath: IS_PRODUCTION ? undefined : "/",
  },
  devtool: IS_PRODUCTION ? 'source-map' : 'inline-source-map',
  entry: {
    "js/beforePyret": './src/web/js/beforePyret.js',
    "js/ide": './src/web/js/ide.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PYRET': JSON.stringify(process.env.PYRET),
      'process.env.CURRENT_PYRET_RELEASE': JSON.stringify(process.env.CURRENT_PYRET_RELEASE),
    }),
    new HtmlWebpackPlugin({
      title: 'code.pyret.org',
      filename: 'views/ide.html',
      favicon: 'node_modules/pyret-lang/img/pyret-icon.png',
      chunks: ['js/ide'],
    })
  ].concat(IS_PRODUCTION ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ] : []),
  devServer: IS_PRODUCTION ? false : {
    progress: true,
    contentBase: path.join(__dirname, 'build', 'web')
  }
};
