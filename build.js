const path = require('path');
const fs = require('fs');
const glob = require("glob");

function copyFiles(from, to, pattern = '/**/*') {
    glob.sync(`${from}${pattern}`)
        .filter(file => fs.statSync(file).isFile())
        .map(file => ({
            from: file,
            to: file.replace(from, to)
        }))
        .forEach(file => {
            const dirName = path.dirname(file.to);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, {recursive: true});
            }
            fs.copyFileSync(file.from, file.to);
        });
}

copyFiles('src/styles', 'build');
fs.copyFileSync('package.json', 'build/package.json');
fs.copyFileSync('README.md', 'build/README.md');

