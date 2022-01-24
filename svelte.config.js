const sveltePreprocess = require("svelte-preprocess");

module.exports = {
  preprocess: sveltePreprocess({
    scss: {
      includePaths: [`./node_modules`],
    },
  }),
};
