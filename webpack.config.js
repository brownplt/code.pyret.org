var path = require('path');
var webpack = webpack = require('webpack');

var IS_PRODUCTION = process.env.NODE_ENV == 'production';
var SRC_DIRECTORY = path.resolve(__dirname, 'src');
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
      include: [SRC_DIRECTORY],
      loader: "babel",
      query: {
        cacheDirectory: true
      }
    }].concat(
      (process.env.COVERAGE || process.env.CONTINUOUS_INTEGRATION) ?
      [{
        test: /\.js/,
        loader: 'isparta',
        include: SRC_DIRECTORY,
        exclude: /node_modules/
      }] :
      []
    ),
  },
  resolve: {
    root: [path.resolve("./node_modules")],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_DB_URL': JSON.stringify(process.env.FIREBASE_DB_URL),
      'process.env.FIREBASE_BUCKET': JSON.stringify(process.env.FIREBASE_BUCKET),

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
  devServer: IS_PRODUCTION ? false : {
    inline: true,
    hot: true,
    progress: true,
    contentBase: path.join(__dirname, 'build', 'web'),
    port: 5001
  },
  progress: true
};
