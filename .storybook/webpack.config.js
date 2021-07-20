const autoPreprocess = require("svelte-preprocess");
const webpack = require("webpack");
const dotenv = require("dotenv").config();
const path = require("path");

module.exports = ({ config, mode }) => {
  const svelteLoader = config.module.rules.find(
    (r) => r.loader && r.loader.includes("svelte-loader"),
  );
  svelteLoader.options = {
    // enable run-time checks when not in production
    dev: false,
    // we'll extract any component CSS out into
    // a separate file - better for performance
    preprocess: autoPreprocess(),
  };

  config.resolve.extensions.push(".ts", ".tsx");
  config.resolve.alias["@commons"] = path.resolve(__dirname, `../commons/src/`);
  config.plugins.push(
    new webpack.EnvironmentPlugin(
      dotenv.error ? { ...process.env } : dotenv.parsed,
    ),
  );
  return config;
};
