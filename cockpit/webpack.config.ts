const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack'); // Add this line
const [mode, devtool] =
  process.env.NODE_ENV === 'production'
    ? ['production', 'source-map']
    : ['development', 'inline-source-map'];

const output = {
  path: path.resolve('cockpit/public'),
  filename: 'main.js',
  sourceMapFilename: '[file].map',
};

const plugins = [
  new MiniCssExtractPlugin({
    ignoreOrder: true,
  }),
  new webpack.DefinePlugin({
    'process.env.IS_ON_PREMISE': JSON.stringify(true),
  }),
];

module.exports = {
  entry: './src/AppCockpit.tsx',
  output,
  mode,
  devtool,
  plugins,
  devServer: {
    historyApiFallback: true, // Ensures all routes are served with `index.html`
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
    },
    modules: [
      'node_modules',
      // this tells webpack to check `node_modules`
      // and `pkg/lib` for modules. This allows us
      // to import `cockpit` and `cockpit/fsinfo`
      path.resolve(__dirname, '../pkg/lib'),
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../pkg/lib'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
        resolve: { fullySpecified: false },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // Handles image files
      },
    ],
  },
};
