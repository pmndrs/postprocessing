import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./test/e2e",
	webServer: {
		command: "python3 -m http.server 3000 --directory test/e2e/pages",
		port: 3000
	},
	use: {
		browserName: "chromium",
		channel: "chromium",
		baseURL: "http://127.0.0.1:3000",
		viewport: { width: 400, height: 225 },
		deviceScaleFactor: 1
	},
	expect: {
		toHaveScreenshot: {
			threshold: 0.1,
			maxDiffPixelRatio: 0.001
		}
	}
});
