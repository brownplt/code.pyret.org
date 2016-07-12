var path = require('path');
var webpack = webpack = require('webpack');

var IS_PRODUCTION = process.env.NODE_ENV == 'production';

module.exports = {
  output: {
    path: path.resolve(__dirname, "build", "web"),
    filename: "[name].js",
    publicPath: IS_PRODUCTION ? undefined : process.env.ASSET_BASE_URL+"/",
  },
  devtool: IS_PRODUCTION ? 'source-map' : 'inline-source-map',
  entry: {
    "js/beforePyret": './src/web/js/beforePyret.js',
    "js/ide": './src/web/js/ide.js',
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'node_modules', 'pyret-ide', 'src'),
      ],
      loader: "babel",
      query: {
        cacheDirectory: true
      }
    }],
  },
  resolve: {
    root: [path.resolve("./node_modules")],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PYRET': JSON.stringify(process.env.PYRET),
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      'process.env.CURRENT_PYRET_RELEASE': JSON.stringify(process.env.CURRENT_PYRET_RELEASE),
    }),
  ].concat(IS_PRODUCTION ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
  ] : [
    new webpack.HotModuleReplacementPlugin(),
  ]),
  babel: {
    presets: ['es2015', 'react'],
    sourceMaps: true,
  },
  devServer: IS_PRODUCTION ? false : {
    inline: true,
    hot: true,
    progress: true,
    contentBase: path.join(__dirname, 'build', 'web'),
    port: 5001
  },
  progress: true
};
