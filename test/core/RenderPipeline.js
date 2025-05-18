import test from "ava";
import { GeometryPass, RenderPipeline } from "postprocessing";
import { PerspectiveCamera, Scene } from "three";

test("can be instantiated and disposed", t => {

	const object = new RenderPipeline();
	object.dispose();

	t.pass();

});

test("resetting output default buffer should not throw", t => {

	const scene = new Scene();
	const camera = new PerspectiveCamera();

	const pipeline = new RenderPipeline();
	const geometryPass = new GeometryPass(scene, camera);

	pipeline.add(geometryPass);
	t.notThrows(() => geometryPass.output.removeDefaultBuffer());

});
