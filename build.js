const path = require('path');
const fs = require('fs');
const glob = require("glob");
const sass = require('sass');

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

// copyFiles('src/scripts', 'build');
copyFiles('src/styles', 'build');

// [...glob.sync(`build/*/mdc-*.scss`), 'build/styles.scss']
//     .filter(file => file.indexOf('.import.') < 0)
//     .forEach(file => fs.writeFileSync(file.replace('.scss', '.css'), sass.renderSync({file}).css));

fs.copyFileSync('package.json', 'build/package.json');
fs.copyFileSync('README.md', 'build/README.md');

