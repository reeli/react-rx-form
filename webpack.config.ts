import config from "config";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

const BASE_DIRS = {
  app: "./guide",
  dist: "./public",
};

const BASE_PATH = process.env.NODE_ENV === "production" ? "/react-rx-form" : "/";

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
    publicPath: BASE_PATH,
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
      new TerserPlugin({
        parallel: true,
        terserOptions: {
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
    },
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    modules: [__dirname, "node_modules"],
  },
  mode: (process.env.NODE_ENV as any) || "development",
};

export = webpackConfig;
