/* eslint-disable no-console */
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");
const lernaConf = require("../lerna.json");
const templatePath = path.join(__dirname, "./template");
const { promisify } = require("util");
const { resolve } = require("path");
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }),
  );
  return files.reduce((a, f) => a.concat(f), []);
}

const optionsPrompt = [
  {
    type: "input",
    name: "name",
    message:
      "What should your component be called? Use dashes and lowercase only, please. Examples: agenda, contact-list, composer",
  },
];

const NAME_TEMPLATE_REGEXP = new RegExp(`[$]NAME[$]`, "gm");

async function patchPackageFile(targetFolderPath, options) {
  const pkgInfo = {
    name: `@nylas/components-${options.name}`,
    version: lernaConf.version,
  };

  const pkgFilePath = path.join(targetFolderPath, "package.json");
  const pkgContents = JSON.parse((await fs.readFile(pkgFilePath)).toString());

  const promise = await fs.writeFile(
    pkgFilePath,
    JSON.stringify({ ...pkgInfo, ...pkgContents }, null, 2),
  );
  console.log("✅  patch Package File");
  return promise;
}

async function patchFiles(targetFolderPath, options) {
  return Promise.all(
    (await getFiles(targetFolderPath)).map(async (filepath) => {
      const content = (await fs.readFile(filepath)).toString();
      const newContent = content.replace(NAME_TEMPLATE_REGEXP, options.name);
      const promise = await fs.writeFile(filepath, newContent);
      console.log(`✅  patch ${filepath}`);
      return promise;
    }),
  );
}

async function patchRootPkg(options) {
  const rootPkgPath = path.join(process.cwd(), `./package.json`);
  const content = JSON.parse((await fs.readFile(rootPkgPath)).toString());
  content.dependencies[
    `@nylas/components-${options.name}`
  ] = `file:components/${options.name}`;
  const promise = await fs.writeFile(
    rootPkgPath,
    JSON.stringify(content, null, 2),
  );
  console.log("✅  patch Root Pkg");
  return promise;
}

const INJECTION_STRING = "<!-- $INJECT_NEW_COMPONENT_HERE$ -->";

async function patchRootIndex(options) {
  const rootIndexPath = path.join(process.cwd(), `./index.html`);
  const content = (await fs.readFile(rootIndexPath)).toString();
  const newContent = content.replace(
    INJECTION_STRING,
    `<li><a href="components/${options.name}/src/index.html">${options.name}</a></li>
      ${INJECTION_STRING}`,
  );
  const promise = await fs.writeFile(rootIndexPath, newContent);
  console.log("✅  patch Root Index");
  return promise;
}

async function scaffold(options) {
  const targetFolder = path.join(process.cwd(), `./components/${options.name}`);
  await fs.copy(templatePath, targetFolder);
  await Promise.all([
    patchPackageFile(targetFolder, options),
    patchFiles(targetFolder, options),
    patchRootPkg(options),
    patchRootIndex(options),
  ]);
  console.log("All done!");
}

async function newComponent() {
  const options = await inquirer.prompt(optionsPrompt);
  await scaffold(options);
  const filesPath = path.join(process.cwd(), `./components/${options.name}`);
  console.log("Some outstanding tasks left:");
  console.log(` - [✔️] Commit new files: ${filesPath}`);
  console.log(
    ` - [✔️] Create component manifest in DynamoDB for demo purposes: ${options.name}-demo`,
  );
}

return newComponent();
