import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSkyboxUrls } from "../../src/utils/SkyboxUtils.ts";

describe("SkyboxUtils", () => {

	it("creates URLs in the expected cube-map order", () => {

		const globalObject = globalThis as { document?: { baseURI: string } };
		const previousDocument = globalObject.document;
		globalObject.document = { baseURI: "https://example.test/manual/" };

		try {

			assert.deepEqual(getSkyboxUrls("sunset", ".jpg"), [
				"https://example.test/manual/img/textures/skies/sunset/px.jpg",
				"https://example.test/manual/img/textures/skies/sunset/nx.jpg",
				"https://example.test/manual/img/textures/skies/sunset/py.jpg",
				"https://example.test/manual/img/textures/skies/sunset/ny.jpg",
				"https://example.test/manual/img/textures/skies/sunset/pz.jpg",
				"https://example.test/manual/img/textures/skies/sunset/nz.jpg"
			]);

		} finally {

			if(previousDocument === undefined) {

				delete globalObject.document;

			} else {

				globalObject.document = previousDocument;

			}

		}

	});

});
