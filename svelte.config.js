const preprocess = require("svelte-preprocess");

// Only used for tests using @testing-library/svelte
module.exports = {
  preprocess: preprocess({
    scss: {
      includePaths: [`./node_modules`],
    },
  }),
};
