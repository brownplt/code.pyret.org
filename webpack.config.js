var path = require('path');
var webpack = webpack = require('webpack');

var IS_PRODUCTION = process.env.NODE_ENV == 'production';

module.exports = {
  output: {
    path: path.resolve(__dirname, "build", "web", "js"),
    filename: "[name].js",
  },
  devtool: IS_PRODUCTION ? 'source-map' : 'inline-source-map',
  entry: {
    "beforePyret": './src/web/js/beforePyret.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PYRET': JSON.stringify(process.env.PYRET),
    }),
  ].concat(IS_PRODUCTION ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ] : []),
};
