/* eslint-disable no-console */
import preprocess from "svelte-preprocess";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import path from "path";
import dotenv from "dotenv";
import esbuild from "rollup-plugin-esbuild";
import svelte from "rollup-plugin-svelte";
import svelteSVG from "rollup-plugin-svelte-svg";
import pluginJson from "@rollup/plugin-json";
import css from "rollup-plugin-css-only";

const ROOT = "../..";
dotenv.config({ path: path.resolve(ROOT, ".env") });
const production =
  process.env.NODE_ENV !== "development" && !process.env.ROLLUP_WATCH;

const config = {
  output: {
    sourcemap: true,
    format: "umd",
    name: "app",
    file: "index.js",
  },
  plugins: [
    resolve({
      extensions: [".ts", ".js", ".json"],
      browser: true,
      dedupe: ["svelte", "wc.svelte"],
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
    pluginJson(),
  ],
  watch: {
    clearScreen: false,
    exclude: [".github/**", ".husky/**", ".vscode/**", ".git/**"],
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
  preprocess: preprocess({
    scss: {
      includePaths: [`${ROOT}/node_modules`],
    },
  }),
  emitCss: false,
  compilerOptions: {
    customElement: true,
  },
};

export const svelteWebConfig = ({ svg = false, json = false }) => {
  const config = [
    svelte({
      preprocess: preprocess({
        scss: {
          includePaths: [`../../node_modules`],
        },
      }),
      emitCss: true,
      compilerOptions: {
        customElement: false,
      },
      exclude: /\.wc\.svelte$/,
    }),
    css({ output: "nylas-component.css" }),
    svelte({
      preprocess: preprocess({
        preserve: ["button", "button.svelte-1bkwwtq"],
        scss: {
          prependData: `
          @use "./nylas-component.css";`,
        },
      }),
      emitCss: false,
      compilerOptions: {
        customElement: true,
      },
      include: /\.wc\.svelte$/,
    }),
  ];

  if (svg) {
    config.unshift(svelteSVG());
  }
  if (json) {
    config.push(pluginJson());
  }

  return config;
};
