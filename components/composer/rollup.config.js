import config, {
  svelteWebComponentsConfig,
  svelteComponentsConfig,
} from "../../rollup.common.config";
import svelteSVG from "rollup-plugin-svelte-svg";
import json from "@rollup/plugin-json";

config.plugins.unshift(
  json(),
  svelteSVG(),
  svelteWebComponentsConfig,
  svelteComponentsConfig,
);

export default { ...config, input: "src/main.ts" };
