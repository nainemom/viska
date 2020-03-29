const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (config) => {
  const output = {};
  const plugins = [
    new VueLoaderPlugin(),
    new webpack.EnvironmentPlugin(['NODE_ENV', 'SERVER_URL']),
  ];


  output.path = path.resolve(__dirname, '../docs');
  output.filename = 'bundle.js';
  // output.publicPath = path.resolve(__dirname, '../public');
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
      // {
      //   test: /\.(css)$/,
      //   loaders: [
      //     'style-loader',
      //     'css-loader',
      //   ],
      // },
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
