import config, {
  svelteWebComponentsConfig,
  svelteComponentsConfig,
} from "../../rollup.common.config";
import svelteSVG from "rollup-plugin-svelte-svg";

config.plugins.unshift(
  svelteSVG(),
  svelteWebComponentsConfig,
  svelteComponentsConfig,
);

export default { ...config, input: "src/main.ts" };
