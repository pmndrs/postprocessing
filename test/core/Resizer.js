import test from "ava";
import { Resizer } from "../../";

test("can be instantiated", t => {

	t.truthy(new Resizer(null));

});

test("should use scale if width and height are both set to AUTO_SIZE", t => {

	const resizer = new Resizer({
		setSize(width, height) {}
	});

	resizer.base.set(1920, 1080);
	resizer.scale = 0.5;

	t.is(resizer.width, 1920 * 0.5);
	t.is(resizer.height, 1080 * 0.5);

});

test("should pass the base size to the resizable object when changing width or height", t => {

	const resizer = new Resizer({

		setSize(width, height) {

			t.is(width, 1920);
			t.is(height, 1080);

		}

	});

	resizer.base.set(1920, 1080);
	resizer.width = Resizer.AUTO_SIZE;
	resizer.height = 480;

});

test("properly calculates sizes when using AUTO_SIZE", t => {

	const resizer = new Resizer({
		setSize(width, height) {}
	});

	const aspect = 1920 / 1080;
	resizer.base.set(1920, 1080);

	resizer.width = 512;
	resizer.height = 256;

	t.is(resizer.width, 512);
	t.is(resizer.height, 256);

	resizer.width = Resizer.AUTO_SIZE;
	resizer.height = 480;

	t.is(resizer.width, Math.round(480 * aspect));

	resizer.width = 720;
	resizer.height = Resizer.AUTO_SIZE;

	t.is(resizer.height, Math.round(720 / aspect));

});
