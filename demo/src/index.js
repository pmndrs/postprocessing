import { DemoManager } from "three-demo";
import { WebGLRenderer } from "three";
import { EffectComposer } from "../../src";

import { BloomDemo } from "./demos/BloomDemo.js";
import { BokehDemo } from "./demos/BokehDemo.js";
import { RealisticBokehDemo } from "./demos/RealisticBokehDemo.js";
import { BlurDemo } from "./demos/BlurDemo.js";
import { DepthDemo } from "./demos/DepthDemo.js";
import { DotScreenDemo } from "./demos/DotScreenDemo.js";
import { FilmDemo } from "./demos/FilmDemo.js";
import { GlitchDemo } from "./demos/GlitchDemo.js";
import { OutlineDemo } from "./demos/OutlineDemo.js";
import { PixelationDemo } from "./demos/PixelationDemo.js";
import { GodRaysDemo } from "./demos/GodRaysDemo.js";
import { RenderDemo } from "./demos/RenderDemo.js";
import { ShockWaveDemo } from "./demos/ShockWaveDemo.js";
import { SMAADemo } from "./demos/SMAADemo.js";
import { ToneMappingDemo } from "./demos/ToneMappingDemo.js";

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

	document.getElementById("viewport").children[0].style.display = "initial";

}

/**
 * Handles demo load events.
 *
 * @private
 * @param {Event} event - An event.
 */

function onLoad(event) {

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
	const renderer = new WebGLRenderer({
		logarithmicDepthBuffer: true,
		antialias: true
	});

	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000);

	// Initialise the demo manager.
	manager = new DemoManager(viewport, {
		aside: document.getElementById("aside"),
		composer: new EffectComposer(renderer, {
			stencilBuffer: true,
			depthTexture: true
		})
	});

	// Setup demo switch and load event handlers.
	manager.addEventListener("change", onChange);
	manager.addEventListener("load", onLoad);

	// Register demos.
	manager.addDemo(new RenderDemo());
	manager.addDemo(new BloomDemo());
	manager.addDemo(new BlurDemo());
	manager.addDemo(new BokehDemo());
	manager.addDemo(new RealisticBokehDemo());
	manager.addDemo(new DepthDemo());
	manager.addDemo(new DotScreenDemo());
	manager.addDemo(new FilmDemo());
	manager.addDemo(new GlitchDemo());
	manager.addDemo(new GodRaysDemo());
	manager.addDemo(new OutlineDemo());
	manager.addDemo(new PixelationDemo());
	manager.addDemo(new ShockWaveDemo());
	manager.addDemo(new SMAADemo());
	manager.addDemo(new ToneMappingDemo());

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
