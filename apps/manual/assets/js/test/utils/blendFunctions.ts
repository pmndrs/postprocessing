import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as Postprocessing from "postprocessing";
import { blendFunctions } from "../../src/utils/blendFunctions.ts";

describe("blendFunctions", () => {

	it("includes every BlendFunction implementation exposed by postprocessing", () => {

		const implementations = Object.entries(Postprocessing)
			.filter(([name, value]) => (
				name.endsWith("BlendFunction") &&
				name !== "BlendFunction" &&
				typeof value === "function"
			))
			.map(([, value]) => new (value as new () => { name: string })());

		const implementationNames = implementations.map(x => x.name).sort();
		const configuredNames = Object.keys(blendFunctions).sort();

		assert.deepEqual(configuredNames, implementationNames);

	});

});
