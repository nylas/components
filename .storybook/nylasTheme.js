import { create } from "@storybook/theming/create";

export default create({
  base: "dark",

  colorPrimary: "#CB62E3",
  colorSecondary: "#00E5BF",

  // UI
  appBg: "black",
  appContentBg: "#454954",
  appBorderColor: "grey",
  appBorderRadius: 0,

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: "monospace",

  // Text colors
  textColor: "white",
  textInverseColor: "rgba(255,255,255,0.9)",

  // Toolbar default and active colors
  barTextColor: "black",
  barSelectedColor: "#00E5BF",
  barBg: "white",

  // Form colors
  inputBg: "#E5FFFB",
  inputBorder: "silver",
  inputTextColor: "black",
  inputBorderRadius: 0,

  brandTitle: "Nylas Components",
  brandUrl: "https://nylas.com",
  brandImage:
    "https://nylas-static-assets.s3-us-west-2.amazonaws.com/nylas-logo-2020.png",
});
