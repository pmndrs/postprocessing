import {
	HalfFloatType,
	PCFSoftShadowMap,
	sRGBEncoding,
	Vector3,
	WebGLRenderer
} from "three";

import { calculateVerticalFoV, DemoManager } from "three-demo";
import { EffectComposer, OverrideMaterialManager } from "../../src";
import { ProgressManager } from "./utils/ProgressManager";

import { AntialiasingDemo } from "./demos/AntialiasingDemo";
import { BloomDemo } from "./demos/BloomDemo";
import { BlurDemo } from "./demos/BlurDemo";
import { ColorDepthDemo } from "./demos/ColorDepthDemo";
import { ColorGradingDemo } from "./demos/ColorGradingDemo";
import { DepthOfFieldDemo } from "./demos/DepthOfFieldDemo";
import { GlitchDemo } from "./demos/GlitchDemo";
import { GodRaysDemo } from "./demos/GodRaysDemo";
import { OutlineDemo } from "./demos/OutlineDemo";
import { PatternDemo } from "./demos/PatternDemo";
import { PixelationDemo } from "./demos/PixelationDemo";
import { ShockWaveDemo } from "./demos/ShockWaveDemo";
import { SSAODemo } from "./demos/SSAODemo";
import { TextureDemo } from "./demos/TextureDemo";
import { TiltShiftDemo } from "./demos/TiltShiftDemo";
import { ToneMappingDemo } from "./demos/ToneMappingDemo";
import { PerformanceDemo } from "./demos/PerformanceDemo";

window.addEventListener("load", (event) => {

	const debug = (window.location.hostname === "localhost");
	const viewport = document.getElementById("viewport");
	const demoCache = new WeakSet();

	// Create and configure the renderer.
	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.outputEncoding = sRGBEncoding;
	renderer.debug.checkShaderErrors = debug;
	renderer.setSize(viewport.clientWidth, viewport.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x000000, 0.0);
	renderer.shadowMap.type = PCFSoftShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;
	renderer.info.autoReset = false;

	// Enable the override material workaround.
	OverrideMaterialManager.workaroundEnabled = true;

	// Create the effect composer.
	const composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType
	});

	// Create the demo manager.
	const manager = new DemoManager(viewport, {
		aside: document.getElementById("aside"),
		renderer
	});

	// Setup demo switch and load event handlers.
	manager.addEventListener("change", (event) => {

		composer.reset();
		composer.addPass(event.demo.renderPass);
		renderer.shadowMap.needsUpdate = true;

		ProgressManager.reset();
		document.querySelector(".loading").classList.remove("hidden");

	});

	manager.addEventListener("load", (event) => {

		const demo = event.demo;
		const camera = demo.getCamera();
		demo.renderPass.camera = camera;

		if(!demoCache.has(demo)) {

			// Prevent stuttering when new objects come into view.
			demo.scene.traverse((node) => void (node.frustumCulled = false));
			manager.render(0.0);
			demo.scene.traverse((node) => void (node.frustumCulled = true));
			demoCache.add(demo);

		}

		document.querySelector(".loading").classList.add("hidden");

	});

	window.addEventListener("resize", (event) => {

		const width = window.innerWidth;
		const height = window.innerHeight;
		const demo = manager.getCurrentDemo();

		if(demo !== null) {

			const camera = demo.getCamera();

			if(camera !== null) {

				const aspect = Math.max(width / height, 16 / 9);
				const vFoV = calculateVerticalFoV(90, aspect);
				camera.fov = vFoV;

			}

		}

		manager.setSize(width, height);
		composer.setSize(width, height);

	});

	document.addEventListener("keyup", (event) => {

		if(event.key === "h") {

			const aside = document.querySelector("aside");
			const footer = document.querySelector("footer");

			event.preventDefault();
			aside.classList.toggle("hidden");
			footer.classList.toggle("hidden");

		} else if(event.key === "c") {

			const camera = manager.getCurrentDemo().getCamera();

			if(camera !== null) {

				const v = new Vector3();
				console.log("Camera position", camera.position);
				console.log("World direction", camera.getWorldDirection(v));
				console.log("Target position", v.addVectors(
					camera.position,
					camera.getWorldDirection(v)
				));

			}

		}

	});

	const demos = [
		new AntialiasingDemo(composer),
		new BloomDemo(composer),
		new BlurDemo(composer),
		new ColorDepthDemo(composer),
		new ColorGradingDemo(composer),
		new DepthOfFieldDemo(composer),
		new GlitchDemo(composer),
		new GodRaysDemo(composer),
		new OutlineDemo(composer),
		new PatternDemo(composer),
		new PixelationDemo(composer),
		new TiltShiftDemo(composer),
		new ShockWaveDemo(composer),
		new SSAODemo(composer),
		new TextureDemo(composer),
		new ToneMappingDemo(composer),
		new PerformanceDemo(composer)
	];

	const id = window.location.hash.slice(1);
	const exists = demos.reduce((a, b) => (a || b.id === id), false);

	if(!exists) {

		// Invalid URL hash: demo doesn't exist.
		window.location.hash = "";

	}

	for(const demo of demos) {

		manager.addDemo(demo);

	}

	requestAnimationFrame(function render(timestamp) {

		requestAnimationFrame(render);
		renderer.info.reset();
		manager.render(timestamp);

	});

});

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
