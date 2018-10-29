import { DemoManager } from "three-demo";
import { WebGLRenderer } from "three";
import { EffectComposer } from "../../src";

import { BloomDemo } from "./demos/BloomDemo.js";
import { BokehDemo } from "./demos/BokehDemo.js";
import { ColorCorrectionDemo } from "./demos/ColorCorrectionDemo.js";
import { RealisticBokehDemo } from "./demos/RealisticBokehDemo.js";
import { BlurDemo } from "./demos/BlurDemo.js";
import { DotScreenDemo } from "./demos/DotScreenDemo.js";
import { GlitchDemo } from "./demos/GlitchDemo.js";
import { GridDemo } from "./demos/GridDemo.js";
import { OutlineDemo } from "./demos/OutlineDemo.js";
import { PixelationDemo } from "./demos/PixelationDemo.js";
import { GodRaysDemo } from "./demos/GodRaysDemo.js";
import { ScanlineDemo } from "./demos/ScanlineDemo.js";
import { SepiaDemo } from "./demos/SepiaDemo.js";
import { ShockWaveDemo } from "./demos/ShockWaveDemo.js";
import { SMAADemo } from "./demos/SMAADemo.js";
import { SSAODemo } from "./demos/SSAODemo.js";
import { TextureDemo } from "./demos/TextureDemo.js";
import { ToneMappingDemo } from "./demos/ToneMappingDemo.js";
import { VignetteDemo } from "./demos/VignetteDemo.js";

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
	const size = composer.renderer.getSize();
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

	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000);

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

	// Register demos.
	manager.addDemo(new BloomDemo(composer));
	manager.addDemo(new BlurDemo(composer));
	manager.addDemo(new BokehDemo(composer));
	manager.addDemo(new RealisticBokehDemo(composer));
	manager.addDemo(new ColorCorrectionDemo(composer));
	manager.addDemo(new DotScreenDemo(composer));
	manager.addDemo(new GlitchDemo(composer));
	manager.addDemo(new GodRaysDemo(composer));
	manager.addDemo(new GridDemo(composer));
	manager.addDemo(new OutlineDemo(composer));
	manager.addDemo(new PixelationDemo(composer));
	manager.addDemo(new ScanlineDemo(composer));
	manager.addDemo(new SepiaDemo(composer));
	manager.addDemo(new ShockWaveDemo(composer));
	manager.addDemo(new SMAADemo(composer));
	manager.addDemo(new SSAODemo(composer));
	manager.addDemo(new TextureDemo(composer));
	manager.addDemo(new ToneMappingDemo(composer));
	manager.addDemo(new VignetteDemo(composer));

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
