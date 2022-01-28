import config, { svelteWebConfig } from "../../rollup.common.config";

config.plugins = [
  ...svelteWebConfig({ svg: true, json: true }),
  ...config.plugins,
];

export default { ...config, input: "src/main.ts" };
