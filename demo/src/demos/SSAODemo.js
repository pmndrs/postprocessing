import {
	CubeTextureLoader,
	PerspectiveCamera,
	Vector2,
	WebGLRenderer
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";
import { CornellBox } from "./objects/CornellBox.js";

import {
	BlendFunction,
	DepthEffect,
	EffectPass,
	NormalPass,
	SSAOEffect,
	SMAAEffect,
	SMAAImageLoader
} from "../../../src";

/**
 * An SSAO demo setup.
 */

export class SSAODemo extends PostProcessingDemo {

	/**
	 * Constructs a new SSAO demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("ssao", composer);

		/**
		 * A renderer that uses a shadow map.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer = null;

		/**
		 * An SSAO effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.ssaoEffect = null;

		/**
		 * A depth effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.depthEffect = null;

		/**
		 * An effect pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass = null;

		/**
		 * A pass that renders scene normals.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.normalPass = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const path = "textures/skies/starry/";
		const format = ".png";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onError = reject;
				loadingManager.onLoad = resolve;

				cubeTextureLoader.load(urls, (t) => {

					assets.set("sky", t);

				});

				smaaImageLoader.load(([search, area]) => {

					assets.set("smaa-search", search);
					assets.set("smaa-area", area);

				});

			} else {

				resolve();

			}

		});

	}

	/**
	 * Creates the scene.
	 */

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;

		// Create a renderer with shadows enabled.

		const renderer = ((renderer) => {

			const size = renderer.getSize(new Vector2());
			const pixelRatio = renderer.getPixelRatio();

			renderer = new WebGLRenderer({
				antialias: false
			});

			renderer.setSize(size.width, size.height);
			renderer.setPixelRatio(pixelRatio);
			renderer.shadowMap.enabled = true;

			return renderer;

		})(composer.getRenderer());

		composer.replaceRenderer(renderer);
		this.renderer = renderer;

		// Camera.

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
		camera.position.set(0, 0, 35);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		scene.add(...CornellBox.createLights());

		// Objects.

		scene.add(CornellBox.createEnvironment());
		scene.add(CornellBox.createActors());

		// Passes.

		const normalPass = new NormalPass(scene, camera);

		const depthEffect = new DepthEffect({
			blendFunction: BlendFunction.SKIP
		});

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
			blendFunction: BlendFunction.MULTIPLY,
			samples: 11,
			rings: 4,
			distanceThreshold: 0.3,	// Render up to a distance of ~300 world units
			distanceFalloff: 0.02,	// with an additional 20 units of falloff.
			rangeThreshold: 0.001,
			rangeFalloff: 0.001,
			luminanceInfluence: 0.7,
			radius: 18.25,
			scale: 1.0,
			bias: 0.05
		});

		const effectPass = new EffectPass(camera, smaaEffect, ssaoEffect, depthEffect);
		this.renderPass.renderToScreen = false;
		effectPass.renderToScreen = true;

		this.ssaoEffect = ssaoEffect;
		this.depthEffect = depthEffect;
		this.effectPass = effectPass;
		this.normalPass = normalPass;

		composer.addPass(normalPass);
		composer.addPass(effectPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effectPass = this.effectPass;
		const normalPass = this.normalPass;
		const ssaoEffect = this.ssaoEffect;
		const depthEffect = this.depthEffect;
		const blendMode = ssaoEffect.blendMode;
		const uniforms = ssaoEffect.uniforms;

		const RenderMode = {
			DEFAULT: 0,
			NORMALS: 1,
			DEPTH: 2
		};

		const params = {
			"distance": {
				"threshold": uniforms.get("distanceCutoff").value.x,
				"falloff": uniforms.get("distanceCutoff").value.y - uniforms.get("distanceCutoff").value.x
			},
			"proximity": {
				"threshold": uniforms.get("proximityCutoff").value.x,
				"falloff": uniforms.get("proximityCutoff").value.y - uniforms.get("proximityCutoff").value.x
			},
			"lum influence": uniforms.get("luminanceInfluence").value,
			"scale": uniforms.get("scale").value,
			"bias": uniforms.get("bias").value,
			"render mode": RenderMode.DEFAULT,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		function toggleRenderMode() {

			const mode = Number.parseInt(params["render mode"]);

			effectPass.enabled = (mode === RenderMode.DEFAULT || mode === RenderMode.DEPTH);
			normalPass.renderToScreen = (mode === RenderMode.NORMALS);
			depthEffect.blendMode.blendFunction = (mode === RenderMode.DEPTH) ? BlendFunction.NORMAL : BlendFunction.SKIP;

			effectPass.recompile();

		}

		menu.add(params, "render mode", RenderMode).onChange(toggleRenderMode);

		menu.add(ssaoEffect, "samples").min(1).max(32).step(1).onChange(() => effectPass.recompile());
		menu.add(ssaoEffect, "rings").min(1).max(16).step(1).onChange(() => effectPass.recompile());
		menu.add(ssaoEffect, "radius").min(0.01).max(50.0).step(0.01);

		menu.add(params, "lum influence").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("luminanceInfluence").value = params["lum influence"];

		});

		let f = menu.addFolder("Distance Cutoff");

		f.add(params.distance, "threshold").min(0.0).max(1.0).step(0.0001).onChange(() => {

			ssaoEffect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f.add(params.distance, "falloff").min(0.0).max(1.0).step(0.0001).onChange(() => {

			ssaoEffect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f = menu.addFolder("Proximity Cutoff");

		f.add(params.proximity, "threshold").min(0.0).max(0.05).step(0.0001).onChange(() => {

			ssaoEffect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		f.add(params.proximity, "falloff").min(0.0).max(0.01).step(0.0001).onChange(() => {

			ssaoEffect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		menu.add(params, "bias").min(-1.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("bias").value = params.bias;

		});

		menu.add(params, "scale").min(0.0).max(2.0).step(0.001).onChange(() => {

			uniforms.get("scale").value = params.scale;

		});

		menu.add(params, "opacity").min(0.0).max(3.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			effectPass.recompile();

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		this.renderer.dispose();

	}

}
