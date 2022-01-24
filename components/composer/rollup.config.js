import config, { svelteConfig } from "../../rollup.common.config";
import svelte from "rollup-plugin-svelte";
import svelteSVG from "rollup-plugin-svelte-svg";
import json from "@rollup/plugin-json";

config.plugins.unshift(svelteSVG());

config.plugins.unshift(
  svelte({
    ...svelteConfig,
  }),
);
config.plugins.unshift(json());

export default { ...config, input: "src/main.ts" };
