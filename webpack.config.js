const path = require('path');
const webpack = require('webpack');
// eg: new es3ifyPlugin()
// const es3ifyPlugin = require('es3ify-webpack-plugin')

module.exports = {
  entry: {},
  output: {
    filename: '[name].js'
  },
  // mode: 'production',
  // mode: 'development',
  watch: true,
  profile: true,
  cache: true,
  externals: {
    EditTable: 'EditTable'
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        // awesome-typescript-loader ts-loader
        use: 'awesome-typescript-loader',
        include: [path.resolve(__dirname, 'src')],
        exclude: [path.resolve(__dirname, 'node_modules')]
      }
    ]
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ],
    // directories where to look for modules
    extensions: ['.ts', '.tsx', '.js', '.jsx']
    // extensions that are used
  },
}
