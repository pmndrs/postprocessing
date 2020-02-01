import { Color, PerspectiveCamera, Vector3 } from "three";
import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { Sponza } from "./objects/Sponza.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	BokehEffect,
	DepthEffect,
	EdgeDetectionMode,
	EffectPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	VignetteEffect
} from "../../../src";

/**
 * A bokeh demo setup.
 */

export class BokehDemo extends PostProcessingDemo {

	/**
	 * Constructs a new bokeh demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("bokeh", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.depthEffect = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.bokehEffect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass0 = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass1 = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer().capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = reject;

				Sponza.load(assets, loadingManager, anisotropy);

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
		const renderer = composer.getRenderer();

		// Camera.

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 2000);
		camera.position.set(9.75, 5, 0.75);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 5, -1.25);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0xeeeeee);

		// Lights.

		scene.add(...Sponza.createLights());

		// Objects.

		scene.add(assets.get("sponza"));

		// Passes.

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.setEdgeDetectionThreshold(0.05);

		const bokehEffect = new BokehEffect({
			focus: 0.61,
			dof: 0.17,
			aperture: 0.0265,
			maxBlur: 0.01
		});

		const depthEffect = new DepthEffect({
			blendFunction: BlendFunction.SKIP
		});

		const effectPass0 = new EffectPass(camera, depthEffect, smaaEffect);
		const effectPass1 = new EffectPass(camera, bokehEffect, new VignetteEffect());

		this.depthEffect = depthEffect;
		this.bokehEffect = bokehEffect;

		this.effectPass0 = effectPass0;
		this.effectPass1 = effectPass1;

		composer.addPass(effectPass0);
		composer.addPass(effectPass1);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effectPass0 = this.effectPass0;
		const effectPass1 = this.effectPass1;
		const depthEffect = this.depthEffect;
		const bokehEffect = this.bokehEffect;
		const uniforms = bokehEffect.uniforms;
		const blendMode = bokehEffect.blendMode;

		const params = {
			"focus": uniforms.get("focus").value,
			"dof": uniforms.get("dof").value,
			"aperture": uniforms.get("aperture").value,
			"blur": uniforms.get("maxBlur").value,
			"show depth": false,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("focus").value = params.focus;

		});

		menu.add(params, "dof").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("dof").value = params.dof;

		});

		menu.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(() => {

			uniforms.get("aperture").value = params.aperture;

		});

		menu.add(params, "blur").min(0.0).max(0.1).step(0.001).onChange(() => {

			uniforms.get("maxBlur").value = params.blur;

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			effectPass1.recompile();

		});

		menu.add(params, "show depth").onChange(() => {

			depthEffect.blendMode.blendFunction = params["show depth"] ? BlendFunction.NORMAL : BlendFunction.SKIP;
			effectPass1.enabled = !params["show depth"];
			effectPass0.renderToScreen = params["show depth"];
			effectPass0.recompile();

		});

	}

}
