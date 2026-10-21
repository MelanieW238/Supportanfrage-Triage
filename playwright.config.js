const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://melaniew238.github.io/Supportanfrage-Triage/',
    trace: 'retain-on-failure',
    screenshot: { mode: 'only-on-failure', fullPage: true },
    launchOptions: {
      // Lokal ist nur Revision 1243 installiert; das Paket erwartet 1248. Umgeht den Browser-Download.
      executablePath: process.env.CHROMIUM_PATH,
    },
  },
});
