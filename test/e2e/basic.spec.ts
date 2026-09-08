import { test, expect } from "@playwright/test";

test("renders the canvas", async({ page }) => {

	await page.goto("/basic.html");
	const canvas = page.locator("#canvas");
	await expect(canvas).toHaveScreenshot();

});
