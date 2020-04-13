const pkg = require('../package.json');
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');

process.env.PKG_VER = require('../package.json').version;

module.exports = (config) => {
  const output = {};
  const plugins = [
    new VueLoaderPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'SERVER_URL', 'PKG_VER']),
  ];


  output.path = path.resolve(__dirname, '../docs');
  output.publicPath = '/';
  output.filename = 'bundle-[hash].js';
  output.chunkFilename = '[name].bundle-[hash].js';

  plugins.push(
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      filename: path.resolve(__dirname, '../docs/index.html'),
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
      },
    ]),
    new OfflinePlugin({
      safeToUseOptionalCaches: true,
      publicPath: output.publicPath,
      version() {
        return pkg.version;
      },
      excludes: [
        'CNAME',
      ],
      caches: 'all',
      AppCache: false,
      updateStrategy: 'all',
      ServiceWorker: {
        events: true
      },
    }),
    new WebpackPwaManifest({
      name: 'Viska Chat',
      short_name: 'Viska',
      description: 'Anonymous Chat Application.',
      background_color: '#fff',
      theme_color: '#745C89',
      start_url: '/',
      icons: [{
        src: path.resolve('./static/logo.png'),
        sizes: [96, 128, 192, 256, 384, 512],
      }],
      inject: true,
    }),
  );

  const entry = path.resolve(__dirname, '../src/index.js');

  const { mode } = config;

  const resolve = {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      // '@docs': path.resolve(__dirname, '../docs-src'),
    },
  };

  const module = {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
          },
        },
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        loaders: [
          'file-loader',
        ],
      },
    ],
  };



  return {
    entry,
    mode,
    output,
    module,
    resolve,
    plugins,
  };
};
