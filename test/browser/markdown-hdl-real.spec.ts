import { test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

test.skip(process.env.HDL_BROWSER_TESTS !== '1', 'Run npm run test:hdl:browser after building the app');
test('real browser development HDL integration', () => {
    test.setTimeout(900_000);
    execFileSync(process.execPath, ['script/test-hdl-browser.mjs'], {
        stdio: 'inherit',
        env: { ...process.env, HDL_APP_MODE: 'development', HDL_APP_DIST: 'report/hdl-development' },
    });
});
