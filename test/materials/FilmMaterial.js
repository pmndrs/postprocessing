import test from "ava";
import { FilmMaterial } from "../../build/postprocessing.js";

test("can be created", t => {

	const object = new FilmMaterial();

	t.truthy(object);

});
