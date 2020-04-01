const rimraf = require('rimraf');
const fs = require('fs-extra');
const replace = require('replace-in-file');

const componentsFolder = 'components';
const mainFolder = 'main';

rimraf.sync(componentsFolder);
rimraf.sync(mainFolder);

fs.copySync('node_modules/@material', componentsFolder);
fs.copySync('node_modules/material-components-web', mainFolder);

/*replace.sync({
    files: [`${componentsFolder}/!**!/!*.ts`, `${mainFolder}/!**!/!*.ts`],
    from: /module ("|')@material\//g,
    to: `module $1material-components-web/`
});*/

for (let i = 0; i < 10; i++) {

    let foldersPath = new Array(i).fill('*').join('/');
    foldersPath = foldersPath ? `/${foldersPath}` : '';

    let relativePath = new Array(i).fill('..').join('/');
    relativePath = relativePath ? `/${relativePath}` : '';

    const extensions = '{scss,js}';

    replace.sync({
        files: [`${componentsFolder}${foldersPath}/*.${extensions}`, `${mainFolder}${foldersPath}/*.${extensions}`],
        from: /("|')@material\//g,
        to: `$1.${relativePath}/`
    });

}
