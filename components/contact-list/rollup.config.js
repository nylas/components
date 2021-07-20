import config, { svelteConfig } from "../../rollup.common.config";
import svelte from "rollup-plugin-svelte";

config.plugins.unshift(
  svelte({
    ...svelteConfig,
  }),
);

export default { ...config, input: "src/main.ts" };
