import { HalfFloatType, PCFSoftShadowMap, sRGBEncoding, Vector2, WebGLRenderer } from "three";
import { DemoManager } from "three-demo";

import { EffectComposer } from "../../src";

import { BloomDemo } from "./demos/BloomDemo.js";
import { BlurDemo } from "./demos/BlurDemo.js";
import { BokehDemo } from "./demos/BokehDemo.js";
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
import { PerformanceDemo } from "./demos/PerformanceDemo.js";

import { ProgressManager } from "./utils/ProgressManager.js";

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
	renderer.shadowMap.needsUpdate = true;
	composer.replaceRenderer(renderer);
	composer.reset();
	composer.addPass(demo.renderPass);

	ProgressManager.reset();
	document.querySelector(".loading").classList.remove("hidden");

}

/**
 * Handles demo load events.
 *
 * @private
 * @param {Event} event - An event.
 */

function onLoad(event) {

	document.querySelector(".loading").classList.add("hidden");

	// Let the main render pass use the camera of the current demo.
	event.demo.renderPass.camera = event.demo.camera;

}

/**
 * Performs initialization tasks when the page has been fully loaded.
 *
 * @private
 * @param {Event} event - An event.
 */

window.addEventListener("load", (event) => {

	const viewport = document.getElementById("viewport");

	// Create and configure the renderer. Don't enable antialias!
	renderer = new WebGLRenderer();
	renderer.outputEncoding = sRGBEncoding;
	renderer.debug.checkShaderErrors = true;
	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000, 0.0);
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Create the effect composer.
	composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType,
		stencilBuffer: true
	});

	// Create the demo manager.
	manager = new DemoManager(viewport, {
		aside: document.getElementById("aside"),
		renderer
	});

	// Setup demo switch and load event handlers.
	manager.addEventListener("change", onChange);
	manager.addEventListener("load", onLoad);

	const demos = [
		new BloomDemo(composer),
		new BlurDemo(composer),
		new BokehDemo(composer),
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
		new PerformanceDemo(composer)
	];

	const id = demos.map((demo) => demo.id).indexOf(window.location.hash.slice(1));

	if(id === -1) {

		// Invalid URL hash: demo doesn't exist.
		window.location.hash = "";

	}

	for(const demo of demos) {

		manager.addDemo(demo);

	}

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
 * Performs initialization tasks when the document is ready.
 *
 * @private
 * @param {Event} event - An event.
 */

document.addEventListener("DOMContentLoaded", (event) => {

	const img = document.querySelector(".info img");
	const div = document.querySelector(".info div");

	if(img !== null && div !== null) {

		img.addEventListener("click", (event) => {

			div.classList.toggle("hidden");

		});

	}

	ProgressManager.initialize();

});

/**
 * Toggles the visibility of the interface on H key press.
 *
 * @private
 * @param {Event} event - An event.
 */

document.addEventListener("keydown", (event) => {

	const aside = document.getElementById("aside");

	if(aside !== null && event.key === "h") {

		event.preventDefault();
		aside.classList.toggle("hidden");

	}

});
