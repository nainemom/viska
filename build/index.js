const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const cli = require('../utils/cli.js');

const port = cli.hasArg('--port') ? parseInt(cli.getArg('--port')) : 8080;
const mode = cli.hasArg('--production') ? 'production' : 'development';
const watch = cli.hasArg('--watch');

const webpackConfig = require('./webpack.config.js')({
  mode,
  watch,
});

const compiler = webpack(webpackConfig);

if (watch) {
  cli.write('Serving...');
  const devServer = {
    contentBase: 'src',
    port,
    stats: 'none',
    host: '0.0.0.0',
    clientLogLevel: 'none',
    liveReload: true,
    quiet: false,
    headers: { 'Access-Control-Allow-Origin': '*' },
    disableHostCheck: true,
    watchOptions: {
      poll: true,
    },
  };
  new WebpackDevServer(compiler, devServer).listen(devServer.port, () => {});
} else {
  cli.write(`Building...`);
  compiler.run((e,d) => {
    console.log(e);
    console.log(d);
    cli.write('Done!');
  });
}
