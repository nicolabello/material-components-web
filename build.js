const rimraf = require('rimraf');
const fs = require('fs-extra');
const replace = require('replace-in-file');

const componentsFolder = 'components';
const mainFolder = 'main';

rimraf.sync(componentsFolder);
rimraf.sync(mainFolder);

fs.copySync('node_modules/@material', componentsFolder);
fs.copySync('node_modules/material-components-web', mainFolder);


for (let i = 1; i < 10; i++) {
    replace.sync({
        files: `${componentsFolder}/${new Array(i).fill('*').join('/')}/*.scss`,
        from: /@material\//g,
        to: `./${new Array(i).fill('..').join('/')}/`
    });
}

replace.sync({
    files: `${mainFolder}/*.scss`,
    from: /@material\//g,
    to: `./../${componentsFolder}/`
});
