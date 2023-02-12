var path = require('path');
var fs = require('fs');
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
    "js/dashboard/index": './src/web/js/dashboard/index.js',
    "js/beforePyret": './src/web/js/beforePyret.js',
    "js/beforeBlocks": './src/web/js/beforeBlocks.js',
  },
  module: {
    rules: [
      {test: /\.css$/, loaders: ["style-loader", "css-loader"]},
      {test:/.png|.jpg|.jpeg|.gif|.svg/, loader: "url-loader?limit=10000"},
      {
        test: /\.js$/,
        enforce: "pre",
        include: [
          SRC_DIRECTORY,
        ],
        loader: "babel-loader",
        query: {
          cacheDirectory: true
        }
      }]
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
    alias: { },
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
  ],
  optimization: { minimize: IS_PRODUCTION },
  devServer: IS_PRODUCTION ? {} : {
    inline: true,
    port: 5001,
    proxy: {
      "/**": {
        target: 'http://localhost:5000',
      }
    }
  },
};
