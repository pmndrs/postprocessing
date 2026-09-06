import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
	FrameGraph,
	GBuffer,
	GBufferResource,
	RenderTargetResource
} from "postprocessing";

import type { WebGLRenderer } from "three";
import { TestPass } from "../../support/TestPass.ts";
import { WebGLRendererMock } from "../../support/WebGLRendererMock.ts";

const renderer = new WebGLRendererMock() as WebGLRenderer;

describe("FrameGraph", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new FrameGraph());

	});

	it("can be disposed", () => {

		const object = new FrameGraph();
		assert.doesNotThrow(() => object.dispose());

	});

	it("can add a pass", () => {

		const graph = new FrameGraph();
		const pass = new TestPass();

		assert.doesNotThrow(() => graph.add(pass));

	});

	it("can declare tasks as terminal outputs", () => {

		const pass = new TestPass({ name: "Test" });
		const graph = new FrameGraph();

		graph.add(pass);
		graph.output(pass);

		assert.doesNotThrow(() => graph.output(pass));

	});

	it("rejects output declarations of tasks that are not in the graph", () => {

		const pass = new TestPass({ name: "Test" });
		const graph = new FrameGraph();

		assert.throws(() => graph.output(pass));

	});

	it("rejects output declarations after a task has been removed", () => {

		const pass = new TestPass({ name: "Test" });
		const graph = new FrameGraph();

		graph.add(pass);
		graph.remove(pass);

		assert.throws(() => graph.output(pass));

	});

	it("renders an empty graph without a renderer", () => {

		const graph = new FrameGraph();
		assert.doesNotThrow(() => graph.render());

	});

	it("renders an empty graph", () => {

		const graph = new FrameGraph({ renderer });
		assert.doesNotThrow(() => graph.render());

	});

	it("renders valid graphs", () => {

		const execution: string[] = [];
		const pass = new TestPass({ name: "Test", execution });
		const graph = new FrameGraph({ renderer });

		graph.add(pass);
		graph.output(pass);
		graph.render();

		assert.deepEqual(execution, ["Test"]);

	});

	it("removes output declarations when tasks are removed", () => {

		const execution: string[] = [];
		const pass = new TestPass({ name: "Test", execution });
		const graph = new FrameGraph({ renderer });

		graph.add(pass);
		graph.output(pass);
		graph.remove(pass);
		graph.render();

		assert.deepEqual(execution, []);

	});

	it("does not execute passes when no renderer is available", () => {

		const execution: string[] = [];
		const pass = new TestPass({ name: "Test", execution });
		const graph = new FrameGraph();

		graph.add(pass);
		graph.output(pass);
		graph.render();

		assert.deepEqual(execution, []);

	});

	it("executes independent passes in insertion order", () => {

		const execution: string[] = [];
		const first = new TestPass({ name: "First", execution });
		const second = new TestPass({ name: "Second", execution });
		const graph = new FrameGraph({ renderer });

		graph.add(first, second);
		graph.output(first, second);
		graph.render();

		assert.deepEqual(execution, ["First", "Second"]);

	});

	it("orders a producer before its consumers and supports fan-out", () => {

		const execution: string[] = [];
		const producer = new TestPass({ name: "Producer", execution });
		const first = new TestPass({ name: "First", execution });
		const second = new TestPass({ name: "Second", execution });
		const graph = new FrameGraph({ renderer });

		first.read(producer);
		second.read(producer);

		graph.add(first, second, producer);
		graph.output(first, second);
		graph.render();

		assert.deepEqual(execution, ["Producer", "First", "Second"]);

	});

	it("materializes aliased resources as the same render target", () => {

		const firstTarget = new RenderTargetResource();
		const secondTarget = new RenderTargetResource();

		secondTarget.alias(firstTarget);

		const first = new TestPass({ name: "First", target: firstTarget });
		const second = new TestPass({ name: "Second", target: secondTarget });
		const consumer = new TestPass({ name: "Consumer" });

		consumer.read(first);
		consumer.read(second);

		const graph = new FrameGraph({ renderer });
		graph.add(first, second, consumer);
		graph.output(consumer);

		assert.equal(
			first.output.defaultBuffer?.renderTarget,
			second.output.defaultBuffer?.renderTarget
		);

	});

	it("rejects missing required inputs", () => {

		const missing = new TestPass({
			name: "Missing",
			target: new RenderTargetResource(),
			requiredTextures: ["missing"]
		});

		const graph = new FrameGraph({ renderer });

		assert.throws(() => {

			graph.add(missing);
			graph.output(missing);

		});

	});

	it("rejects cycles", () => {

		const a = new TestPass({ name: "CycleA" });
		const b = new TestPass({ name: "CycleB" });
		const graph = new FrameGraph({ renderer });

		a.read(b);
		b.read(a);

		assert.throws(() => {

			graph.add(a, b);
			graph.output(b);

		});

	});

	it("culls unused branches", () => {

		const execution: string[] = [];
		const culled = new TestPass({ name: "Culled", execution });
		const live = new TestPass({ name: "Live", execution });
		const graph = new FrameGraph({ renderer });

		graph.add(culled, live);
		graph.output(live);
		graph.render();

		assert.deepEqual(execution, ["Live"]);

	});

	it("retains active textures", () => {

		const gBuffer = new GBufferResource();
		const producer = new TestPass({ name: "GBufferWriter", target: gBuffer });

		const consumer = new TestPass({
			name: "NormalReader",
			target: new RenderTargetResource(),
			requiredTextures: [GBuffer.NORMAL]
		});

		const graph = new FrameGraph({ renderer });

		consumer.read(producer);

		graph.add(producer, consumer);
		graph.output(consumer);

		assert.notEqual(gBuffer.textures.get(GBuffer.COLOR)?.value, null);
		assert.notEqual(gBuffer.textures.get(GBuffer.NORMAL)?.value, null);

	});

	it("allocates target dimensions from the resource resolution", () => {

		const target = new RenderTargetResource();
		target.resolution.setPreferredSize(40, 24);

		const pass = new TestPass({ name: "Sized", target });
		const graph = new FrameGraph({ renderer });

		graph.add(pass);
		graph.output(pass);

		assert.equal(target.value?.width, 40);
		assert.equal(target.value?.height, 24);

	});

	it("rejects same-pass read/write feedback", () => {

		const pass = new TestPass({ name: "Feedback" });
		const graph = new FrameGraph({ renderer });

		pass.read(pass);

		assert.throws(() => {

			graph.add(pass);
			graph.output(pass);

		});

	});

});
