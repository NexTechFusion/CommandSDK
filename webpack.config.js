const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  mode: "production",
  entry: {
    youtubeSummarize: "./src/sumarizeYoutube.ts",
    sumarizeWebsite: "./src/sumarizeWebsite.ts",
    fixText: "./src/textFixSuggestoion.ts",
  },
  target: "node", // <-- Important
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // Skip type checking
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  externals: [nodeExternals({})],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd", // <-- Important
  },
};
