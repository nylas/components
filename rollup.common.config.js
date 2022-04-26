/* eslint-disable no-console */
import autoPreprocess from "svelte-preprocess";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import replace from "@rollup/plugin-replace";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import istanbul from "rollup-plugin-istanbul";
import path from "path";
import dotenv from "dotenv";
import esbuild from "rollup-plugin-esbuild";
const ROOT = "../..";
dotenv.config({ path: path.resolve(ROOT, ".env") });

export const production =
  process.env.NODE_ENV !== "development" && !process.env.ROLLUP_WATCH;

const config = {
  output: {
    sourcemap: "inline",
    format: "umd",
    name: "app",
    file: "index.js",
  },
  plugins: [
    resolve({
      extensions: [".ts", ".js", ".json"],
      browser: true,
      dedupe: ["svelte"],
    }),
    replace({
      "process.env.API_GATEWAY": `'${process.env.API_GATEWAY}'`,
      "process.env.NODE_ENV": process.env.NODE_ENV
        ? `'${process.env.NODE_ENV}'`
        : '"development"',
    }),
    alias({
      resolve: [".js", ".scss", ".svelte", ".scss", ".ts"],
      entries: [
        {
          find: "@commons",
          replacement: path.resolve(`${ROOT}/commons/src`),
        },
      ],
    }),
    esbuild({
      include: [`${ROOT}/**/*.ts+(|x)`],
      minify: !!production,
    }),
    commonjs(),
    json(),
    !production &&
      istanbul({
        extensions: [".js", ".svelte"],
        include: ["components/**/*"],
        exclude: ["**/*spec.js", "node_modules"],
        sourceMap: true,
        compact: false,
        debug: true,
      }),
  ],
  watch: {
    clearScreen: false,
  },
};

if (process.env.ROLLUP_WATCH) {
  config.plugins.push(
    livereload({
      watch: "index.js",
      port: (() => {
        const port = 1024 + Math.floor(Math.random() * 48127);
        console.log("Using port for livereload:", port);
        return port;
      })(),
    }),
  );
}

export default config;

export const svelteConfig = {
  dev: !production,
  preprocess: autoPreprocess({
    scss: {
      includePaths: [`${ROOT}/node_modules`],
    },
  }),
  emitCss: false,
  compilerOptions: {
    dev: !production,
    customElement: true,
  },
};
