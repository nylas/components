import config, { svelteConfig } from "../../rollup.common.config";
import svelte from "rollup-plugin-svelte";
import svelteSVG from "rollup-plugin-svelte-svg";

config.plugins.unshift(svelteSVG());
config.plugins.unshift(
  svelte({
    ...svelteConfig,
  }),
);

export default { ...config, input: "src/main.ts" };
