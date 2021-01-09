import test from "ava";
import { LookupTexture3D } from "../../../";

test("can be created", t => {

	t.truthy(new LookupTexture3D());

});

test("can create neutral data", t => {

	const expectedData = new Float32Array([
		0, 0, 0, 1, 0, 0,
		0, 1, 0, 1, 1, 0,
		0, 0, 1, 1, 0, 1,
		0, 1, 1, 1, 1, 1
	]);

	const result = LookupTexture3D.createNeutral(2);
	t.deepEqual(result.image.data, expectedData);

});
