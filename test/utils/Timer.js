import test from "ava";
import { Timer } from "postprocessing";

const SECONDS_TO_MILLISECONDS = 1e3;

function sleep(ms = 0) {

	return new Promise(resolve => setTimeout(resolve, ms));

}

test("can be instantiated", t => {

	t.truthy(new Timer());

});

test("tracks time correctly", async t => {

	const timer1 = new Timer();
	t.is(timer1.elapsed, 0);
	timer1.update();
	t.is(Math.round(timer1.elapsed * SECONDS_TO_MILLISECONDS), 0);
	await sleep(1);
	timer1.update();
	t.true(Math.round(timer1.elapsed * SECONDS_TO_MILLISECONDS) > 0);

	const timer2 = new Timer();
	t.is(timer2.elapsed, 0);
	timer2.update();
	t.is(Math.round(timer2.elapsed * SECONDS_TO_MILLISECONDS), 0);
	await sleep(1);
	timer2.update();
	t.true(Math.round(timer2.elapsed * SECONDS_TO_MILLISECONDS) > 0);

});
