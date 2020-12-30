import { Color, PerspectiveCamera, Vector3 } from "three";
import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	EdgeDetectionMode,
	EffectPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	ToneMappingEffect
} from "../../../src";

/**
 * A tone mapping demo setup.
 */

export class ToneMappingDemo extends PostProcessingDemo {

	/**
	 * Constructs a new tone mapping demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("tone-mapping", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

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
		camera.position.set(-0.5, 5, -0.5);
		this.camera = camera;

		// Controls.

		const target = new Vector3(-0.5, 10, 0);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0xeeeeee);

		// Lights.

		scene.add(...Sponza.createLights());

		// Objects.

		scene.add(assets.get(Sponza.tag));

		// Passes.

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const toneMappingEffect = new ToneMappingEffect({
			blendFunction: BlendFunction.NORMAL,
			adaptive: true,
			resolution: 256,
			middleGrey: 0.6,
			maxLuminance: 16.0,
			averageLuminance: 1.0,
			adaptationRate: 2.0
		});

		this.effect = toneMappingEffect;

		const pass = new EffectPass(camera, smaaEffect, toneMappingEffect);
		pass.dithering = true;
		this.pass = pass;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;
		const effect = this.effect;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.resolution,
			"adaptation rate": effect.adaptationRate,
			"average lum": effect.uniforms.get("averageLuminance").value,
			"max lum": effect.uniforms.get("maxLuminance").value,
			"middle grey": effect.uniforms.get("middleGrey").value,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [64, 128, 256, 512, 1024]).onChange(() => {

			effect.resolution = Number(params.resolution);

		});

		let f = menu.addFolder("Luminance");

		f.add(effect, "adaptive");

		f.add(params, "adaptation rate").min(0.0).max(5.0).step(0.01).onChange(() => {

			effect.adaptationRate = params["adaptation rate"];

		});

		f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(() => {

			effect.uniforms.get("averageLuminance").value = params["average lum"];

		});

		f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(() => {

			effect.uniforms.get("maxLuminance").value = params["max lum"];

		});

		f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(() => {

			effect.uniforms.get("middleGrey").value = params["middle grey"];

		});

		f.open();

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.setBlendFunction(Number(params["blend mode"]));

		});

		menu.add(pass, "dithering");

	}

}
