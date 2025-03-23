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
    if (fs.existsSync(directory)) {
        fs.rmSync(directory, { recursive: true });
        fs.mkdirSync(directory);
    } else {
        fs.mkdirSync(directory);
    }
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
    // Create dist/example directory.
    directory = path.resolve(__dirname, '..', 'dist', 'example');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    // Copy example/example.json to dist/example/example.json
    fs.copyFileSync(path.resolve(__dirname, '..', 'example', 'example.json'), path.resolve(__dirname, '..', 'dist', 'example', 'example.json'));
    // Copy files in example directory to dist/example. Create first-example.json.
    const example = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'example', 'example.json')));
    let first = true;
    for (let name in example) {
        fs.copyFileSync(path.resolve(__dirname, '..', 'example', example[name].file), path.resolve(__dirname, '..', 'dist', 'example', example[name].file));
        if (first) {
            const firstExample = {
                name,
                description: example[name].description,
                content: fs.readFileSync(path.resolve(__dirname, '..', 'example', example[name].file)).toString(),
            };
            fs.writeFileSync(path.resolve(__dirname, '..', 'src', 'first-example.json'), JSON.stringify(firstExample, null, 2));
            first = false;
        }
    }
    // Create dist/help directory.
    directory = path.resolve(__dirname, '..', 'dist', 'help');
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    // Copy help/[languages]/*.* to dist/help/[languages]/*.*
    const languages = fs.readdirSync(path.resolve(__dirname, '..', 'help'));
    languages.forEach((language) => {
        directory = path.resolve(__dirname, '..', 'dist', 'help', language);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        const files = fs.readdirSync(path.resolve(__dirname, '..', 'help', language));
        files.forEach((file) => {
            fs.copyFileSync(path.resolve(__dirname, '..', 'help', language, file), path.resolve(__dirname, '..', 'dist', 'help', language, file));
        });
    });
    // Copy README.md, LEIAME.MD and LEAME.md to dist/
    fs.copyFileSync(path.resolve(__dirname, '..', 'README.md'), path.resolve(__dirname, '..', 'dist', 'README.md'));
    fs.copyFileSync(path.resolve(__dirname, '..', 'LEIAME.md'), path.resolve(__dirname, '..', 'dist', 'LEIAME.md'));
    fs.copyFileSync(path.resolve(__dirname, '..', 'LEAME.md'), path.resolve(__dirname, '..', 'dist', 'LEAME.md'));
} catch (err) {
    console.error(err);
}
console.warn('Copying assets to /dist directory done.');
console.log(`Running ${__filename} done.`);
