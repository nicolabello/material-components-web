/*replace.sync({
    files: [`${componentsFolder}/!**!/!*.ts`, `${mainFolder}/!**!/!*.ts`],
    from: /module ("|')@material\//g,
    to: `module $1material-components-web/`
});*/

/*for (let i = 0; i < 10; i++) {

    let foldersPath = new Array(i).fill('*').join('/');
    foldersPath = foldersPath ? `/${foldersPath}` : '';

    let relativePath = new Array(i).fill('..').join('/');
    relativePath = relativePath ? `/${relativePath}` : '';

    const extensions = '{scss,js}';

    replace.sync({
        files: `${componentsFolder}${foldersPath}/!*.${extensions}`,
        from: /("|')@material\//g,
        to: `$1.${relativePath}/`
    });

    replace.sync({
        files: `${mainFolder}${foldersPath}/!*.${extensions}`,
        from: /("|')@material\//g,
        to: `$1.${relativePath}/../${componentsFolder}/`
    });

}*/
