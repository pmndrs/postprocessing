import { Color, PerspectiveCamera, Vector3 } from "three";
import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import * as Sponza from "./objects/Sponza.js";

import {
	BlendFunction,
	DepthEffect,
	EdgeDetectionMode,
	EffectPass,
	NormalPass,
	SSAOEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
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
		const camera = new PerspectiveCamera(50, aspect, 0.3, 1000);
		camera.position.set(9.75, 1.72, 0.75);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 1, -1.25);
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

		const normalPass = new NormalPass(scene, camera);

		const depthEffect = new DepthEffect({
			blendFunction: BlendFunction.SKIP
		});

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.setEdgeDetectionThreshold(0.05);

		// Note: Thresholds and falloff correspond to camera near/far.
		// Example: worldDistance = distanceThreshold * (camera.far - camera.near)
		const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
			blendFunction: BlendFunction.MULTIPLY,
			samples: 11,
			rings: 4,
			distanceThreshold: 0.02,	// Render up to a distance of ~20 world units
			distanceFalloff: 0.0025,	// with an additional ~2.5 units of falloff.
			rangeThreshold: 0.0003,		// Occlusion proximity of ~0.3 world units
			rangeFalloff: 0.0001,			// with ~0.1 units of falloff.
			luminanceInfluence: 0.7,
			radius: 30,
			scale: 1.0,
			bias: 0.05
		});

		const effectPass = new EffectPass(camera, smaaEffect, ssaoEffect, depthEffect);

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
			effectPass.encodeOutput = (mode === RenderMode.DEFAULT);
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

}
