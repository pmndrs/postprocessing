import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { topologicalSortGrouped } from "postprocessing";

describe("topologicalSortGrouped", () => {

	it("groups independent branches into parallel execution levels", () => {

		// A -> [B, C] -> D -> [F, G] -> H -> Canvas
		const graph = new Map<string, string[]>([
			["A", []],
			["B", ["A"]],
			["C", ["A"]],
			["D", ["B", "C"]],
			["F", ["D"]],
			["G", ["D"]],
			["H", ["F", "G"]],
			["Canvas", ["H"]]
		]);

		assert.deepEqual(topologicalSortGrouped(graph), [
			["A"],
			["B", "C"],
			["D"],
			["F", "G"],
			["H"],
			["Canvas"]
		]);

	});

	it("rejects cyclic dependencies", () => {

		const graph = new Map<string, string[]>([
			["A", ["B"]],
			["B", ["A"]]
		]);

		assert.throws(() => topologicalSortGrouped(graph), { name: "Error", message: /cyclic dependency/i });

	});

	it("does not lose edges when dependents are keyed before their dependencies", () => {

		// A consumer-first key order, like the graph built by "FrameGraphCompiler".
		const graph = new Map<string, string[]>([
			["D", ["B", "C"]],
			["B", ["A"]],
			["C", ["A"]],
			["A", []]
		]);

		assert.deepEqual(topologicalSortGrouped(graph), [
			["A"],
			["B", "C"],
			["D"]
		]);

	});

});
