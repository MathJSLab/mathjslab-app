import { defineConfig, devices } from '@playwright/test';

const allBrowsers = process.env.MARKDOWN_BROWSER_PROJECTS === 'all';

export default defineConfig({
    testDir: './test/browser',
    outputDir: './test-results/playwright',
    globalSetup: './test/browser/global-setup.ts',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['html', { outputFolder: 'playwright-report', open: 'never' }], ['line']] : 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        ...(allBrowsers
            ? [
                  { name: 'firefox', use: { ...devices['Desktop Firefox'], video: 'off' as const } },
                  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
              ]
            : []),
    ],
});
