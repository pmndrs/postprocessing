import test from "ava";
import { Viewport } from "postprocessing";

test("can be instantiated", t => {

	t.truthy(new Viewport());

});

test("properly applies pixel ratio", t => {

	const resolution = new Viewport();

	resolution.set(480, 270, 960, 540);
	resolution.pixelRatio = 2;

	t.is(resolution.width, 1920);
	t.is(resolution.height, 1080);
	t.is(resolution.offsetX, 960);
	t.is(resolution.offsetY, 540);

});
