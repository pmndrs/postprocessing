import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GBufferSchema } from "postprocessing";

describe("GBufferSchema", () => {

	it("can be instantiated", () => {

		assert.doesNotThrow(() => new GBufferSchema());

	});

	it("resolves transitive G-Data dependencies", () => {

		const schema = new GBufferSchema();
		schema.gDataDependencies.set("A", new Set(["B"]));
		schema.gDataDependencies.set("B", new Set(["C"]));

		assert.deepEqual(
			schema.resolveGData(["A"]),
			new Set(["A", "B", "C"])
		);

	});

	it("resolves G-Buffer components from transitive G-Data dependencies", () => {

		const schema = new GBufferSchema();
		schema.gDataDependencies.set("A", new Set(["B"]));
		schema.gDataDependencies.set("B", new Set(["C"]));
		schema.gDataBufferSources.set("A", new Set(["BufferA"]));
		schema.gDataBufferSources.set("B", new Set(["BufferB"]));
		schema.gDataBufferSources.set("C", new Set(["BufferC"]));

		assert.deepEqual(
			schema.resolveGBufferComponents(["A"]),
			new Set(["BufferA", "BufferB", "BufferC"])
		);

	});

	it("rejects circular G-Data dependencies", () => {

		const schema = new GBufferSchema();
		schema.gDataDependencies.set("A", new Set(["B"]));
		schema.gDataDependencies.set("B", new Set(["A"]));

		assert.throws(
			() => schema.resolveGDataGraph(["A"]),
			/Circular GData dependency/
		);

	});

});
