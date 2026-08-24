import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
	FrameGraph,
	GBuffer,
	GBufferResource,
	GeometryPass,
	HistoryResource,
	OutputPass,
	RenderTargetResource
} from "postprocessing";

import { PerspectiveCamera, Scene, Texture, WebGLRenderer } from "three";
import { TestPass } from "../../support/TestPass.ts";

// #region Setup

function createGraph(renderer = true): FrameGraph {

	const graph = new FrameGraph(renderer ? { renderer: createRenderer() } : undefined);
	graphs.push(graph);
	return graph;

}

function createRenderer(): WebGLRenderer {

	return {
		autoClear: true,
		domElement: {},
		getPixelRatio: () => 1,
		getSize: (size: { set: (width: number, height: number) => unknown }) => {

			size.set(64, 32);
			return size;

		},
		info: {
			autoReset: true,
			reset: () => undefined
		}
	} as unknown as WebGLRenderer;

}

function addOutputPass(graph: FrameGraph, task: TestPass): void {

	const outputPass = new OutputPass();
	outputPass.input.connect(task.output);
	graph.add(outputPass);

}

function render(graph: FrameGraph): void {

	graph.render();

}

function target(width?: number, height?: number): RenderTargetResource {

	const resource = new RenderTargetResource();

	if(width !== undefined) {

		resource.resolution.preferredWidth = width;

	}

	if(height !== undefined) {

		resource.resolution.preferredHeight = height;

	}

	return resource;

}

const graphs: FrameGraph[] = [];

afterEach(() => {

	for(const graph of graphs.splice(0)) {

		graph.dispose();

	}

});

// #endregion

describe("FrameGraph", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new FrameGraph());

	});

	it("can be disposed", () => {

		const object = new FrameGraph();
		assert.doesNotThrow(() => object.dispose());

	});

	it("can add a pass", () => {

		const scene = new Scene();
		const camera = new PerspectiveCamera();

		const pipeline = new FrameGraph();
		const geometryPass = new GeometryPass({ scene, camera });

		assert.doesNotThrow(() => pipeline.add(geometryPass));

	});

	it("renders an empty graph without a renderer", () => {

		assert.doesNotThrow(() => createGraph(false).render());

	});

	it("does not execute tasks when no renderer is available", () => {

		const execution: string[] = [];
		const task = new TestPass({ name: "task", execution });
		const graph = createGraph(false);

		graph.add(task);
		graph.render();

		assert.deepEqual(execution, []);

	});

	it("executes independent presented tasks in insertion order", () => {

		const execution: string[] = [];
		const first = new TestPass({ name: "first", execution, target: target() });
		const second = new TestPass({ name: "second", execution, target: target() });
		const graph = createGraph();

		graph.add(first, second);
		addOutputPass(graph, first);
		addOutputPass(graph, second);
		render(graph);

		assert.deepEqual(execution, ["first", "second"]);

	});

	it("orders a producer before its consumer and supports fan-out", () => {

		const execution: string[] = [];
		const producer = new TestPass({ name: "producer", execution, target: target() });
		const left = new TestPass({ name: "left", execution, target: target() });
		const right = new TestPass({ name: "right", execution, target: target() });

		left.readFrom(producer);
		right.readFrom(producer);

		const graph = createGraph();
		graph.add(left, right, producer);
		addOutputPass(graph, left);
		addOutputPass(graph, right);
		render(graph);

		assert.deepEqual(execution, ["producer", "left", "right"]);

	});

	it("orders tasks that share one target", () => {

		const execution: string[] = [];
		const shared = target();
		const first = new TestPass({ name: "First", execution, target: shared });
		const geometry = new TestPass({ name: "Geometry", execution, target: shared });
		const graph = createGraph();

		graph.add(geometry, first);
		addOutputPass(graph, geometry);
		render(graph);

		assert.deepEqual(execution, ["First", "Geometry"]);

	});

	it("schedules an intermediate-version reader before the next in-place writer", () => {

		const execution: string[] = [];
		const shared = target();
		const first = new TestPass({ name: "First", execution, target: shared });
		const debug = new TestPass({ name: "Debug", execution, target: target() });
		const geometry = new TestPass({ name: "Geometry", execution, target: shared });

		debug.readFrom(first);
		const graph = createGraph();
		graph.add(geometry, debug, first);
		addOutputPass(graph, debug);
		addOutputPass(graph, geometry);
		render(graph);

		assert.deepEqual(execution, ["First", "Debug", "Geometry"]);

	});

	it("reports the tasks and resource involved in an unschedulable older-version read", () => {

		const execution: string[] = [];
		const shared = target();

		const first = new TestPass({
			name: "First",
			execution,
			target: shared,
			bufferKey: "old"
		});

		const geometry = new TestPass({
			name: "Geometry",
			execution,
			target: shared,
			bufferKey: "new"
		});

		const reader = new TestPass({ name: "OlderReader", execution, target: target() });

		reader.readFrom(first);
		geometry.readFrom(reader);
		reader.readFrom(geometry);

		const graph = createGraph();
		graph.add(first, geometry, reader);
		addOutputPass(graph, reader);

		assert.throws(() => render(graph), /First|Geometry|OlderReader|BUFFER_DEFAULT|cycle|order/i);

	});

	it("rejects missing required inputs and disabled producers only when live", () => {

		const missing = new TestPass({
			name: "Missing",
			target: target(),
			requiredTextures: ["missing"]
		});
		const graph = createGraph();
		graph.add(missing);
		addOutputPass(graph, missing);
		assert.throws(() => render(graph), /missing|required/i);

		const execution: string[] = [];
		const producer = new TestPass({ name: "DisabledProducer", execution, target: target() });
		const consumer = new TestPass({ name: "Consumer", execution, target: target() });
		consumer.readFrom(producer);
		producer.enabled = false;

		const disabledGraph = createGraph();
		disabledGraph.add(producer, consumer);
		addOutputPass(disabledGraph, consumer);
		assert.throws(() => render(disabledGraph), /disabled|producer|required/i);

	});

	it("accepts imported textures as valid required inputs", () => {

		const task = new TestPass({
			name: "Imported",
			target: target(),
			requiredTextures: ["external"]
		});
		task.readImported("external", new Texture());
		const graph = createGraph();

		graph.add(task);
		addOutputPass(graph, task);
		assert.doesNotThrow(() => render(graph));

	});

	it("reports cycles with the involved tasks", () => {

		const a = new TestPass({ name: "CycleA", target: target() });
		const b = new TestPass({ name: "CycleB", target: target() });
		a.readFrom(b);
		b.readFrom(a);

		const graph = createGraph();
		graph.add(a, b);
		addOutputPass(graph, a);

		assert.throws(() => render(graph), /CycleA.*CycleB|CycleB.*CycleA|cycle/i);

	});

	it("gathers subpass resources without sorting the subpass independently", () => {

		const execution: string[] = [];
		const child = new TestPass({ name: "Subpass", execution, target: target() });

		const parent = new TestPass({
			name: "Parent",
			execution,
			target: target(),
			subtasks: [child],
			renderSubtasks: true
		});

		const graph = createGraph();

		graph.add(parent);
		addOutputPass(graph, parent);
		render(graph);

		assert.deepEqual(execution, ["Parent", "Subpass"]);
		assert.ok(child.output.defaultBuffer !== undefined);

	});

	it("culls unpresented branches but keeps live consumers of disabled producers diagnostic", () => {

		const execution: string[] = [];
		const culled = new TestPass({ name: "Culled", execution, target: target() });
		const live = new TestPass({ name: "Live", execution, target: target() });
		const graph = createGraph();

		graph.add(culled, live);
		addOutputPass(graph, live);
		render(graph);

		assert.deepEqual(execution, ["Live"]);

	});

	it("uses the screen binding for an unsampled shared-target presentation chain", () => {

		const shared = target();
		const first = new TestPass({ name: "First", target: shared });
		const geometry = new TestPass({ name: "Geometry", target: shared });
		const graph = createGraph();

		graph.add(first, geometry);
		addOutputPass(graph, geometry);
		render(graph);

		assert.equal(shared.value, null);

	});

	it("materializes a shared target when one of its versions is sampled", () => {

		const shared = target();
		const first = new TestPass({ name: "First", target: shared });
		const geometry = new TestPass({ name: "Geometry", target: shared });
		const effect = new TestPass({ name: "Effect", target: target() });
		effect.readFrom(geometry);
		const graph = createGraph();

		graph.add(first, geometry, effect);
		addOutputPass(graph, effect);
		render(graph);

		assert.notEqual(shared.value, null);

	});

	it("retains named G-Buffer attachments and resolves active attachment reads", () => {

		const gBuffer = new GBufferResource();
		const producer = new TestPass({ name: "GBufferWriter", target: gBuffer });
		const consumer = new TestPass({
			name: "NormalReader",
			target: target(),
			requiredTextures: [GBuffer.NORMAL]
		});
		consumer.readFrom(producer);
		const graph = createGraph();

		graph.add(producer, consumer);
		addOutputPass(graph, consumer);
		render(graph);

		assert.ok(gBuffer.textures.has(GBuffer.COLOR));
		assert.ok(gBuffer.textures.has(GBuffer.NORMAL));

	});

	it("allocates target dimensions from the resource resolution", () => {

		const resource = target(40, 24);
		const task = new TestPass({ name: "Sized", target: resource });
		const graph = createGraph();

		graph.add(task);
		addOutputPass(graph, task);
		render(graph);

		assert.equal(resource.value?.width, 40);
		assert.equal(resource.value?.height, 24);

	});

	it("rejects incompatible effective resolutions for shared writers", () => {

		const shared = target();
		const first = new TestPass({ name: "FirstWriter", target: shared });
		const second = new TestPass({ name: "SecondWriter", target: shared });
		first.resolution.preferredWidth = 32;
		second.resolution.preferredWidth = 64;
		const graph = createGraph();

		graph.add(first, second);
		addOutputPass(graph, second);

		assert.throws(() => render(graph), /resolution|width|FirstWriter|SecondWriter/i);

	});

	it("rejects same-pass read/write feedback", () => {

		const task = new TestPass({ name: "Feedback", target: target() });
		task.readFrom(task);
		const graph = createGraph();

		graph.add(task);
		addOutputPass(graph, task);

		assert.throws(() => render(graph), /feedback|same.*pass|Feedback/i);

	});

	it("replaces and disposes a target when its descriptor changes", () => {

		const resource = target();
		const task = new TestPass({ name: "ReplaceTarget", target: resource });
		const graph = createGraph();
		graph.add(task);
		addOutputPass(graph, task);
		render(graph);

		const previous = resource.value!;
		let disposed = 0;
		const dispose = previous.dispose.bind(previous);
		(previous as { dispose: () => void }).dispose = () => {

			disposed++;
			dispose();

		};
		resource.descriptor.count = 2;
		render(graph);

		assert.notEqual(resource.value, previous);
		assert.equal(disposed, 1);

	});

	it("does not dispose imported textures", () => {

		const texture = new Texture();
		let disposed = 0;
		texture.dispose = () => {

			disposed++;

		};
		const task = new TestPass({
			name: "External",
			target: target(),
			requiredTextures: ["external"]
		});
		task.readImported("external", texture);
		const graph = createGraph();
		graph.add(task);
		addOutputPass(graph, task);
		render(graph);

		assert.equal(disposed, 0);

	});

	it("supports persistent history swapping and reset", () => {

		const history = new HistoryResource();
		const previous = history.previousBuffer;
		const current = history.currentBuffer;
		previous.persistent = true;
		current.persistent = true;

		(history as HistoryResource & { swap(): void }).swap();

		assert.equal(history.previousBuffer, current);
		assert.equal(history.currentBuffer, previous);

		const resettable = history as HistoryResource & { reset(): void };
		assert.equal(typeof resettable.reset, "function");
		assert.doesNotThrow(() => resettable.reset());

	});

});
