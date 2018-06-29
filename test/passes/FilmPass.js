import test from "ava";
import { FilmPass } from "../../build/bundle.js";

test("can be created and destroyed", t => {

	const object = new FilmPass();
	object.dispose();

	t.truthy(object);

});
