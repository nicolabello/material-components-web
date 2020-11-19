const rimraf = require('rimraf');
const path = require('path');
const fs = require('fs');
const replace = require('replace-in-file');
const glob = require("glob");
const download = require('download');

async function downloadAndExtract(url, to) {
    rimraf.sync(to);
    await download(url, to, {extract: true});
}

function copyFiles(from, to, pattern = '/**/*') {
    glob.sync(`${from}${pattern}`)
        .filter(file => fs.statSync(file).isFile())
        .filter(file => file.indexOf('/test/') < 0)
        .map(file => ({
            from: file,
            to: file.replace(from, to).replace(/\/mdc-(.*?)\//gi, '/$1/')
        }))
        .forEach(file => {
            const dirName = path.dirname(file.to);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, {recursive: true});
            }
            fs.copyFileSync(file.from, file.to);
        });
}

function replaceImports(mainFolder) {
    for (let i = 0; i < 10; i++) {

        let foldersPath = new Array(i).fill('*').join('/');
        foldersPath = foldersPath ? `/${foldersPath}` : '';

        let relativePath = new Array(i).fill('..').join('/');
        relativePath = relativePath ? `/${relativePath}` : '';

        replace.sync({
            files: `${mainFolder}${foldersPath}/*.*`,
            from: /("|')@material\//g,
            to: `$1.${relativePath}/`
        });

    }
}

function updateStyles(repoPath, mainFolder) {

    rimraf.sync(mainFolder);

    // Copy all scss files
    copyFiles(`${repoPath}/material-components-web-master/packages`, mainFolder, '/**/*.scss');

    // Replace imports with relative paths
    replaceImports(mainFolder);

    // Create styles.scss
    fs.writeFileSync(`${mainFolder}/styles.scss`, glob.sync(`${mainFolder}/*/mdc-*.scss`)
        .filter(file => file.indexOf('.import.') < 0)
        .map(file => file.replace(mainFolder, '.').replace('.scss', ''))
        .map(file => `@use "${file}";`)
        .join('\n'));

    // Create _members.scss
    fs.writeFileSync(`${mainFolder}/_members.scss`, glob.sync(`${mainFolder}/*/_index.scss`)
        .filter(file => file.indexOf('.import.') < 0)
        .map(file => file.replace(mainFolder, '.').replace('/_index.scss', ''))
        .map(file => `@forward "${file}" as ${path.basename(file)}-*;`)
        .join('\n'));

}

function updateScripts(repoPath, mainFolder) {

    rimraf.sync(mainFolder);

    // Copy all js files
    copyFiles(`${repoPath}/material-components-web-master/packages`, mainFolder, '/**/*.ts');

    // Replace imports with relative paths
    replaceImports(mainFolder);

    // Create index.ts
    fs.writeFileSync(`${mainFolder}/index.ts`, glob.sync(`${mainFolder}/**/component.ts`)
        .map(file => `export * from '${file.replace(mainFolder, '.').replace('.ts', '')}';`)
        .join('\n'));

}

function updateTsConfig(repoPath, mainFolder) {

    rimraf.sync(`${mainFolder}/tsconfig*.json`);

    // Copy all js files
    copyFiles(`${repoPath}/material-components-web-master`, mainFolder, '/tsconfig*.json');

}

(async () => {

    const repoPath = 'temp/material-components-web';
    await downloadAndExtract('https://github.com/material-components/material-components-web/archive/master.zip', repoPath);
    updateStyles(repoPath, 'src/styles');
    updateScripts(repoPath, 'src/scripts');
    updateTsConfig(repoPath, 'src');

})();
