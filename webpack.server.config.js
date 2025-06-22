//const webpack = require('webpack');
const nodeExternals = require("webpack-node-externals");
const path = require("path");


module.exports = (env) => {
	return {
    mode: 'development',
//  entry: path.resolve(__dirname, 'index.ts'),
    entry: env.entry,
    devtool: 'inline-source-map',
    externals: [nodeExternals()],
    output: {
//    path: path.resolve(__dirname),
      path: env.outdir,
      filename: env.outfile,
    },
    resolve: {
      extensions: ['.ts'],
      alias: {
          '/cmn': path.resolve(__dirname, '../maicl/src/d_cmn'),
          '/mdl': path.resolve(__dirname, '../maicl/src/d_mdl'),
          '/utl': path.resolve(__dirname, '../maicl/src/d_utl'),
      },
    },
    target: 'node',
    node: {
      __dirname:  false,
      __filename: false
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.server.json'),
//            configFile: "D:/Top/Dev/ts/mai_express/tsconfig.server.json",
            }
          }
        }
      ]
    }
  }
};
