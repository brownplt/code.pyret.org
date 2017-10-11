var path = require('path');
var fs = require('fs');
var webpack = webpack = require('webpack');

var IS_PRODUCTION = process.env.NODE_ENV == 'production';
var SRC_DIRECTORY = path.resolve(__dirname, 'src');
var IDE_SRC_DIRECTORY = path.resolve(__dirname, 'node_modules', 'pyret-ide', 'src');

module.exports = {
  output: {
    path: path.resolve(__dirname, "build", "web"),
    filename: "[name].js",
    publicPath: IS_PRODUCTION ? undefined : process.env.ASSET_BASE_URL+"/",
  },
  devtool: IS_PRODUCTION ? 'source-map' : 'inline-source-map',
  entry: {
    "js/dashboard/index": './src/web/js/dashboard/index.js',
    "js/beforePyret": './src/web/js/beforePyret.js',
  },
  module: {
    loaders: [
      {test: /\.css$/, loaders: ["style", "css"]},
      {test:/.png|.jpg|.jpeg|.gif|.svg/, loader: "url-loader?limit=10000"},
      {test:/.woff|.woff2/, loader: "url-loader?limit=10000"},
      {test:/.woff|.woff2/, loader: "url-loader?limit=10000"},
      {test:/.ttf|.eot/, loader: "file-loader"},
      {test: /\.less$/, loader:'style!css!less'},
    ],
    preLoaders: [{
      test: /\.js$/,
      include: [
        SRC_DIRECTORY,
        // for some reason, webpack doesn't know how to deal with symlinks
        // when deciding which loaders to use
        fs.realpathSync(IDE_SRC_DIRECTORY),
      ],
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
    alias: {
      'pyret-ide': path.resolve(IDE_SRC_DIRECTORY, 'pyret-ide'),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY),
      'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      'process.env.FIREBASE_DB_URL': JSON.stringify(process.env.FIREBASE_DB_URL),
      'process.env.FIREBASE_BUCKET': JSON.stringify(process.env.FIREBASE_BUCKET),

      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PYRET': JSON.stringify(process.env.PYRET),
      'process.env.PYRET_BACKUP': JSON.stringify(process.env.PYRET_BACKUP),
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
    port: 5001,
    proxy: {
      "/**": {
        target: 'http://localhost:5000',
      }
    }
  },
  progress: true
};
