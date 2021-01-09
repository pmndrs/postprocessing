import test from "ava";
import { LookupTexture3D, TetrahedralUpscaler } from "../../../";

test("generates accurate data", t => {

	const lutNeutral2 = LookupTexture3D.createNeutral(2);
	const expected = LookupTexture3D.createNeutral(32);
	const expectedData = expected.image.data;

	const result = TetrahedralUpscaler.expand(lutNeutral2.image.data, 32);
	let matches = (result.length === expectedData.length);

	for(let i = 0, l = result.length; i < l; ++i) {

		if(Math.abs(result[i] - expectedData[i]) > 1e-7) {

			matches = false;

		}

	}

	t.true(matches, "Should match a neutral LUT of size 32");

});
