import { DemoManager } from "three-demo";
import { Vector2, WebGLRenderer } from "three";
import { EffectComposer } from "../../src";

import { BloomDemo } from "./demos/BloomDemo.js";
import { BlurDemo } from "./demos/BlurDemo.js";
import { BokehDemo } from "./demos/BokehDemo.js";
import { RealisticBokehDemo } from "./demos/RealisticBokehDemo.js";
import { ColorDepthDemo } from "./demos/ColorDepthDemo.js";
import { ColorGradingDemo } from "./demos/ColorGradingDemo.js";
import { GlitchDemo } from "./demos/GlitchDemo.js";
import { GodRaysDemo } from "./demos/GodRaysDemo.js";
import { OutlineDemo } from "./demos/OutlineDemo.js";
import { PatternDemo } from "./demos/PatternDemo.js";
import { PixelationDemo } from "./demos/PixelationDemo.js";
import { ShockWaveDemo } from "./demos/ShockWaveDemo.js";
import { SMAADemo } from "./demos/SMAADemo.js";
import { SSAODemo } from "./demos/SSAODemo.js";
import { TextureDemo } from "./demos/TextureDemo.js";
import { ToneMappingDemo } from "./demos/ToneMappingDemo.js";
import { VignetteDemo } from "./demos/VignetteDemo.js";
import { PerformanceDemo } from "./demos/PerformanceDemo.js";

/**
 * A renderer.
 *
 * @type {WebGLRenderer}
 * @private
 */

let renderer;

/**
 * An effect composer.
 *
 * @type {EffectComposer}
 * @private
 */

let composer;

/**
 * A demo manager.
 *
 * @type {DemoManager}
 * @private
 */

let manager;

/**
 * The main render loop.
 *
 * @private
 * @param {DOMHighResTimeStamp} now - The current time.
 */

function render(now) {

	requestAnimationFrame(render);
	manager.render(now);

}

/**
 * Handles demo change events.
 *
 * @private
 * @param {Event} event - An event.
 */

function onChange(event) {

	const demo = event.demo;

	// Make sure that the main renderer is being used and update it just in case.
	const size = composer.getRenderer().getSize(new Vector2());
	renderer.setSize(size.width, size.height);
	composer.replaceRenderer(renderer);
	composer.reset();
	composer.addPass(demo.renderPass);

	document.getElementById("viewport").children[0].style.display = "initial";

}

/**
 * Handles demo load events.
 *
 * @private
 * @param {Event} event - An event.
 */

function onLoad(event) {

	// Prepare the render pass.
	event.demo.renderPass.camera = event.demo.camera;

	document.getElementById("viewport").children[0].style.display = "none";

}

/**
 * Starts the program.
 *
 * @private
 * @param {Event} event - An event.
 */

window.addEventListener("load", function main(event) {

	// Clean up.
	this.removeEventListener("load", main);

	const viewport = document.getElementById("viewport");

	// Create a custom renderer.
	renderer = new WebGLRenderer({
		logarithmicDepthBuffer: true,
		antialias: false
	});

	renderer.debug.checkShaderErrors = true;
	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000, 0.0);

	// Create an effect composer.
	composer = new EffectComposer(renderer, {
		stencilBuffer: true
	});

	// Initialise the demo manager.
	manager = new DemoManager(viewport, {
		aside: document.getElementById("aside"),
		renderer: renderer
	});

	// Setup demo switch and load event handlers.
	manager.addEventListener("change", onChange);
	manager.addEventListener("load", onLoad);

	const demos = [
		new BloomDemo(composer),
		new BlurDemo(composer),
		new BokehDemo(composer),
		new RealisticBokehDemo(composer),
		new ColorDepthDemo(composer),
		new ColorGradingDemo(composer),
		new GlitchDemo(composer),
		new GodRaysDemo(composer),
		new OutlineDemo(composer),
		new PatternDemo(composer),
		new PixelationDemo(composer),
		new ShockWaveDemo(composer),
		new SMAADemo(composer),
		new SSAODemo(composer),
		new TextureDemo(composer),
		new ToneMappingDemo(composer),
		new VignetteDemo(composer),
		new PerformanceDemo(composer)
	];

	if(demos.map((demo) => demo.id).indexOf(window.location.hash.slice(1)) === -1) {

		// Invalid URL hash: demo doesn't exist.
		window.location.hash = "";

	}

	// Register demos.
	for(const demo of demos) {

		manager.addDemo(demo);

	}

	// Start rendering.
	render();

});

/**
 * Handles browser resizing.
 *
 * @private
 * @param {Event} event - An event.
 */

window.addEventListener("resize", (function() {

	let timeoutId = 0;

	function handleResize(event) {

		const width = event.target.innerWidth;
		const height = event.target.innerHeight;

		manager.setSize(width, height);
		composer.setSize(width, height);

		timeoutId = 0;

	}

	return function onResize(event) {

		if(timeoutId === 0) {

			timeoutId = setTimeout(handleResize, 66, event);

		}

	};

}()));

/**
 * Toggles the visibility of the interface on Alt key press.
 *
 * @private
 * @param {Event} event - An event.
 */

document.addEventListener("keydown", function onKeyDown(event) {

	const aside = this.getElementById("aside");

	if(event.altKey && aside !== null) {

		event.preventDefault();
		aside.style.visibility = (aside.style.visibility === "hidden") ? "visible" : "hidden";

	}

});
