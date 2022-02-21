import test from "ava";
import { Resolution } from "postprocessing/module";

test("can be instantiated", t => {

	t.truthy(new Resolution(null));

});

test("should use scale if width and height are both set to AUTO_SIZE", t => {

	const resolution = new Resolution({ setSize(width, height) {} });

	resolution.setBaseSize(1920, 1080);
	resolution.setScale(0.5);

	t.is(resolution.getWidth(), 1920 * 0.5);
	t.is(resolution.getHeight(), 1080 * 0.5);

});

test("should dispatch event when changing width or height", t => {

	const resolution = new Resolution({ setSize(width, height) {} });

	resolution.addEventListener("change", () => {

		t.is(resolution.getBaseWidth(), 1920);
		t.is(resolution.getBaseHeight(), 1080);

	});

	resolution.setBaseSize(1920, 1080);
	resolution.setPreferredWidth(Resolution.AUTO_SIZE);
	resolution.setPreferredHeight(480);

});

test("properly calculates sizes when using AUTO_SIZE", t => {

	const resolution = new Resolution({ setSize(width, height) {} });

	const aspect = 1920 / 1080;
	resolution.setBaseSize(1920, 1080);

	resolution.setPreferredWidth(512);
	resolution.setPreferredHeight(256);

	t.is(resolution.getWidth(), 512);
	t.is(resolution.getHeight(), 256);

	resolution.setPreferredWidth(Resolution.AUTO_SIZE);
	resolution.setPreferredHeight(480);

	t.is(resolution.getWidth(), Math.round(480 * aspect));

	resolution.setPreferredWidth(720);
	resolution.setPreferredHeight(Resolution.AUTO_SIZE);

	t.is(resolution.getHeight(), Math.round(720 / aspect));

});
