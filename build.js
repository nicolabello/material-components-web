const fs = require("fs-extra");

fs.copySync("node_modules/@material", "build/components");
fs.copySync("node_modules/material-components-web", "build");

const replace = require("replace-in-file");

for (let i = 1; i < 10; i++) {
  replace.sync({
    files: `build/components/${new Array(i).fill("*").join("/")}/*.scss`,
    from: /@material\//g,
    to: `./${new Array(i).fill("..").join("/")}/`
  });
}

  replace.sync({
    files: `build/*.scss`,
    from: /@material\//g,
    to: `./components/`
  });
