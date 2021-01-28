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
	ToneMappingEffect,
	ToneMappingMode
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
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

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

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 2000);
		camera.position.set(-5.15, 8.1, -0.95);
		this.camera = camera;

		// Controls

		const target = new Vector3(-4.4, 8.6, -0.5);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xeeeeee);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const toneMappingEffect = new ToneMappingEffect({
			mode: ToneMappingMode.REINHARD2_ADAPTIVE,
			resolution: 256,
			whitePoint: 16.0,
			middleGrey: 0.6,
			minLuminance: 0.01,
			averageLuminance: 0.01,
			adaptationRate: 1.0
		});

		this.effect = toneMappingEffect;
		composer.addPass(new EffectPass(camera, smaaEffect, toneMappingEffect));

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const renderer = this.composer.getRenderer();
		const effect = this.effect;
		const blendMode = effect.blendMode;
		const adaptiveLuminancePass = effect.adaptiveLuminancePass;
		const adaptiveLuminanceMaterial = adaptiveLuminancePass.getFullscreenMaterial();

		const params = {
			"mode": effect.getMode(),
			"exposure": renderer.toneMappingExposure,
			"resolution": effect.resolution,
			"white point": effect.uniforms.get("whitePoint").value,
			"middle grey": effect.uniforms.get("middleGrey").value,
			"average lum": effect.uniforms.get("averageLuminance").value,
			"min lum": adaptiveLuminanceMaterial.uniforms.minLuminance.value,
			"adaptation rate": adaptiveLuminancePass.adaptationRate,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "mode", ToneMappingMode).onChange((value) => {

			effect.setMode(Number(value));

		});

		menu.add(params, "exposure").min(0.0).max(2.0).step(0.001).onChange((value) => {

			renderer.toneMappingExposure = value;

		});

		let f = menu.addFolder("Reinhard (Modified)");

		f.add(params, "white point").min(2.0).max(32.0).step(0.01).onChange((value) => {

			effect.uniforms.get("whitePoint").value = value;

		});

		f.add(params, "middle grey").min(0.0).max(1.0).step(0.0001).onChange((value) => {

			effect.uniforms.get("middleGrey").value = value;

		});

		f.add(params, "average lum").min(0.0001).max(1.0).step(0.0001).onChange((value) => {

			effect.uniforms.get("averageLuminance").value = value;

		});

		f.open();

		f = menu.addFolder("Reinhard (Adaptive)");

		f.add(params, "resolution", [64, 128, 256, 512]).onChange((value) => {

			effect.resolution = Number(value);

		});

		f.add(params, "adaptation rate").min(0.001).max(3.0).step(0.001).onChange((value) => {

			adaptiveLuminancePass.adaptationRate = value;

		});

		f.add(params, "min lum").min(0.001).max(1.0).step(0.001).onChange((value) => {

			adaptiveLuminanceMaterial.uniforms.minLuminance.value = value;

		});

		f.open();

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

	}

}
