const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const replace = require('replace-in-file');
const glob = require("glob");

const mainFolder = 'styles';

rimraf.sync(mainFolder);

// Copy all scss files
function copyFiles(from, to, pattern = '/**/*') {
    glob.sync(`${from}${pattern}`).forEach(file => {
        const newFile = file.replace(from, to);
        const dirName = path.dirname(newFile);
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, {recursive: true});
        }
        fs.copyFileSync(file, newFile);
    });
}

//copyFiles('node_modules/material-components-web', mainFolder, '/**/*.scss');
copyFiles('node_modules/@material', mainFolder, '/**/*.scss');

// Replace imports with relative paths
for (let i = 0; i < 10; i++) {

    let foldersPath = new Array(i).fill('*').join('/');
    foldersPath = foldersPath ? `/${foldersPath}` : '';

    let relativePath = new Array(i).fill('..').join('/');
    relativePath = relativePath ? `/${relativePath}` : '';

    replace.sync({
        files: `${mainFolder}${foldersPath}/*.scss`,
        from: /("|')@material\//g,
        to: `$1.${relativePath}/`
    });

}

// Create import files
function createImports(baseDir, fileName, pattern) {
    fs.writeFileSync(`${baseDir}/${fileName}`, glob.sync(`${baseDir}${pattern}`)
        .filter(file => file.indexOf('.import.') < 0)
        .map(file => `@use "${file.replace(mainFolder, '.')}";`)
        .join('\n'));
}

createImports(mainFolder, 'styles.scss', '/**/mdc-*.scss');
createImports(mainFolder, '_variables.scss', '/**/_variables.scss');
createImports(mainFolder, '_mixins.scss', '/**/_mixins.scss');
createImports(mainFolder, '_functions.scss', '/**/_functions.scss');
