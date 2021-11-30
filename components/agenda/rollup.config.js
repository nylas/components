import config, {
  svelteWebComponentsConfig,
  svelteComponentsConfig,
} from "../../rollup.common.config";

config.plugins.unshift(svelteWebComponentsConfig, svelteComponentsConfig);

export default { ...config, input: "src/main.ts" };
