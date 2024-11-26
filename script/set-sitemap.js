/**
 * set-sitemap.xml: update lastmod record.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log(`Running ${__filename} ...`);
console.warn('Setting lastmod on sitemap.xml file...');
try {
    const sitemapPath = path.resolve(__dirname, '..', 'sitemap.xml');
    fs.writeFileSync(
        sitemapPath,
        fs
            .readFileSync(sitemapPath, 'utf-8')
            .split(/\r?\n/g)
            .map((line) => {
                const match = /^(\s*<lastmod>)(\d{4}-\d{2}-\d{2})(<\/lastmod>\s*)$/.exec(line);
                return match ? match[1] + new Date().toISOString().substring(0, 10) + match[3] : line;
            })
            .join(os.EOL),
    );
} catch (err) {
    console.error(err);
}
console.warn('Setting lastmod on sitemap.xml file done.');
console.log(`Running ${__filename} done.`);
