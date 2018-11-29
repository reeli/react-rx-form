import * as config from "config";
import HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";
import UglifyJsPlugin from "uglifyjs-webpack-plugin";
import * as webpack from "webpack";

const BASE_DIRS = {
  app: "./src-guide",
  modules: "./src-modules",
  dist: "./public",
};

const GLOBALS = {
  process: {
    env: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development"),
      NODE_CONFIG: JSON.stringify(config),
    },
  },
};

const webpackConfig: webpack.Configuration = {
  context: path.resolve(__dirname, BASE_DIRS.app),
  entry: "./index.tsx",
  output: {
    path: path.resolve(__dirname, BASE_DIRS.dist),
    filename: "[name]-[hash].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // ignore typescript type check, only do transform & compile
              compilerOptions: {
                target: "es5",
                module: "es6", // es module for webpack tree shaking
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
        ],
      },
      {
        test: /\.html$/,
        use: "raw-loader",
      },
      {
        test: /\.(png,jpg,gif,svg,ttf,woff,woff2,eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "assets/[name].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new HtmlWebpackPlugin({
      title: "React Rx Form",
      template: "./index.html",
    }),
  ],
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        common: {
          test: /[\\/]node_modules[\\/](react|redux|rxjs|lodash)/,
          // if you don't splitChunks, there is only 1 js  file
          // so "chunks:all" means extract codes from remaining codes.
          chunks: "all",
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: "all",
        },
      },
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          ecma: 5, // check if the code for uglify is ES5, especially for npm packages in node_modules
          mangle: true,
          compress: true,
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
  resolve: {
    alias: {
      "@react-rx/form": "src",
      lodash: "lodash-es",
      config: path.resolve(__dirname, BASE_DIRS.modules, "./config/index.ts"),
    },
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    modules: [__dirname, "node_modules"],
  },
  mode: (process.env.NODE_ENV as any) || "development",
};

export = webpackConfig;
