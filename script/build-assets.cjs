/**
 * build-assets.cjs: This script creates the build directory and copies all the project assets.
 */
const fs = require('node:fs');
const path = require('node:path');

console.log(`Running ${__filename} ...`);
console.warn('Copying assets to /dist directory...');
try {
    // Create dist directory.
    let directory = path.resolve(__dirname, '..', 'dist');
    fs.mkdirSync(directory, { recursive: true });
    // Copy manifest.json
    fs.copyFileSync(path.resolve(__dirname, '..', 'manifest.json'), path.resolve(__dirname, '..', 'dist', 'manifest.json'));
    // Copy robots.txt
    fs.copyFileSync(path.resolve(__dirname, '..', 'robots.txt'), path.resolve(__dirname, '..', 'dist', 'robots.txt'));
    // Copy sitemap.xml
    fs.copyFileSync(path.resolve(__dirname, '..', 'sitemap.xml'), path.resolve(__dirname, '..', 'dist', 'sitemap.xml'));
    // Create dist/images directory and copy contents of images to it.
    directory = path.resolve(__dirname, '..', 'dist', 'images');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    const images = fs.readdirSync(path.resolve(__dirname, '..', 'images'));
    images.forEach((image) => {
        fs.copyFileSync(path.resolve(__dirname, '..', 'images', image), path.resolve(__dirname, '..', 'dist', 'images', image));
    });
    // Validate and publish the recursive examples manifest and its assets.
    const example = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'example', 'example.json'), 'utf8'));
    require('./helper/example-assets.cjs').writeExamples(path.resolve(__dirname, '..'), example);
    // Create dist/help directory.
    directory = path.resolve(__dirname, '..', 'dist', 'help');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    // Copy root help files and help/[languages]/*.* to dist/help.
    const helpDirectory = path.resolve(__dirname, '..', 'help');
    const helpEntries = fs.readdirSync(helpDirectory, { withFileTypes: true });
    helpEntries.forEach((entry) => {
        const sourcePath = path.resolve(helpDirectory, entry.name);
        const targetPath = path.resolve(__dirname, '..', 'dist', 'help', entry.name);
        if (entry.isFile()) {
            if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
                fs.rmSync(targetPath, { recursive: true, force: true });
            }
            fs.copyFileSync(sourcePath, targetPath);
            return;
        }
        if (!entry.isDirectory()) {
            return;
        }
        directory = targetPath;
        if (fs.existsSync(directory) && fs.statSync(directory).isFile()) {
            fs.rmSync(directory);
        }
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        const files = fs.readdirSync(sourcePath);
        files.forEach((file) => {
            fs.copyFileSync(path.resolve(sourcePath, file), path.resolve(directory, file));
        });
    });
    // Copy README.md, LEIAME.MD and LEAME.md to dist/
    fs.copyFileSync(path.resolve(__dirname, '..', 'README.md'), path.resolve(__dirname, '..', 'dist', 'README.md'));
    fs.copyFileSync(path.resolve(__dirname, '..', 'LEIAME.md'), path.resolve(__dirname, '..', 'dist', 'LEIAME.md'));
    fs.copyFileSync(path.resolve(__dirname, '..', 'LEAME.md'), path.resolve(__dirname, '..', 'dist', 'LEAME.md'));
} catch (err) {
    console.error(err);
    process.exitCode = 1;
}
console.warn('Copying assets to /dist directory done.');
console.log(`Running ${__filename} done.`);
