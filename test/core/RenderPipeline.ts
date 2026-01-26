import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GeometryPass, RenderPipeline } from "postprocessing";
import { PerspectiveCamera, Scene } from "three";

describe("RenderPipeline", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new RenderPipeline());

	});

	it("can be disposed", () => {

		const object = new RenderPipeline();
		assert.doesNotThrow(() => object.dispose());

	});

	it("can add a pass", t => {

		const scene = new Scene();
		const camera = new PerspectiveCamera();

		const pipeline = new RenderPipeline();
		const geometryPass = new GeometryPass(scene, camera);

		assert.doesNotThrow(() => pipeline.add(geometryPass));

	});

	it("can reset the output default buffer", t => {

		const scene = new Scene();
		const camera = new PerspectiveCamera();

		const pipeline = new RenderPipeline();
		const geometryPass = new GeometryPass(scene, camera);

		pipeline.add(geometryPass);
		assert.doesNotThrow(() => geometryPass.output.removeDefaultBuffer());

	});

});
