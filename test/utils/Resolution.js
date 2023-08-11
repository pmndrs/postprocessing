import test from "ava";
import { Resolution } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new Resolution());

});

test("should use scale if width and height are both set to AUTO_SIZE", t => {

	const resolution = new Resolution();

	resolution.setBaseSize(1920, 1080);
	resolution.scale = 0.5;

	t.is(resolution.width, 1920 * 0.5);
	t.is(resolution.height, 1080 * 0.5);

});

test("should dispatch event when changing width or height", t => {

	const resolution = new Resolution();

	resolution.addEventListener("change", () => {

		t.is(resolution.baseWidth, 1920);
		t.is(resolution.baseHeight, 1080);

	});

	resolution.setBaseSize(1920, 1080);
	resolution.preferredWidth = Resolution.AUTO_SIZE;
	resolution.preferredHeight = 480;

});

test("properly calculates sizes when using AUTO_SIZE", t => {

	const resolution = new Resolution();

	const aspect = 1920 / 1080;
	resolution.setBaseSize(1920, 1080);

	resolution.preferredWidth = 512;
	resolution.preferredHeight = 256;

	t.is(resolution.width, 512);
	t.is(resolution.height, 256);

	resolution.preferredWidth = Resolution.AUTO_SIZE;
	resolution.preferredHeight = 480;

	t.is(resolution.width, Math.round(480 * aspect));

	resolution.preferredWidth = 720;
	resolution.preferredHeight = Resolution.AUTO_SIZE;

	t.is(resolution.height, Math.round(720 / aspect));

});
