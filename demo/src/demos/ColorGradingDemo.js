import { Color, PerspectiveCamera, Vector3 } from "three";
import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	BrightnessContrastEffect,
	ColorAverageEffect,
	EdgeDetectionMode,
	EffectPass,
	HueSaturationEffect,
	SepiaEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A color grading demo setup.
 */

export class ColorGradingDemo extends PostProcessingDemo {

	/**
	 * Constructs a new color grading demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("color-grading", composer);

		/**
		 * A brightness/contrast effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.brightnessContrastEffect = null;

		/**
		 * A color average effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.colorAverageEffect = null;

		/**
		 * A hue/saturation effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.hueSaturationEffect = null;

		/**
		 * A sepia effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.sepiaEffect = null;

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
		camera.position.set(-9, 0.5, 0);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 3, -3.5);
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

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);

		const colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);
		const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.SKIP });

		const brightnessContrastEffect = new BrightnessContrastEffect({ blendFunction: BlendFunction.SKIP });
		const hueSaturationEffect = new HueSaturationEffect({ hue: 0.0, saturation: 0.4 });

		const pass = new EffectPass(camera,
			smaaEffect,
			colorAverageEffect,
			sepiaEffect,
			brightnessContrastEffect,
			hueSaturationEffect
		);

		pass.dithering = true;
		this.pass = pass;

		this.brightnessContrastEffect = brightnessContrastEffect;
		this.colorAverageEffect = colorAverageEffect;
		this.hueSaturationEffect = hueSaturationEffect;
		this.sepiaEffect = sepiaEffect;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;

		const brightnessContrastEffect = this.brightnessContrastEffect;
		const colorAverageEffect = this.colorAverageEffect;
		const hueSaturationEffect = this.hueSaturationEffect;
		const sepiaEffect = this.sepiaEffect;

		const params = {
			colorAverage: {
				"opacity": colorAverageEffect.blendMode.opacity.value,
				"blend mode": colorAverageEffect.blendMode.blendFunction
			},
			sepia: {
				"intensity": sepiaEffect.uniforms.get("intensity").value,
				"opacity": sepiaEffect.blendMode.opacity.value,
				"blend mode": sepiaEffect.blendMode.blendFunction
			},
			brightnessContrast: {
				"brightness": brightnessContrastEffect.uniforms.get("brightness").value,
				"contrast": brightnessContrastEffect.uniforms.get("contrast").value,
				"opacity": brightnessContrastEffect.blendMode.opacity.value,
				"blend mode": brightnessContrastEffect.blendMode.blendFunction
			},
			hueSaturation: {
				"hue": 0.0,
				"saturation": hueSaturationEffect.uniforms.get("saturation").value,
				"opacity": hueSaturationEffect.blendMode.opacity.value,
				"blend mode": hueSaturationEffect.blendMode.blendFunction
			}
		};

		let folder = menu.addFolder("Color Average");

		folder.add(params.colorAverage, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			colorAverageEffect.blendMode.opacity.value = params.colorAverage.opacity;

		});

		folder.add(params.colorAverage, "blend mode", BlendFunction).onChange(() => {

			colorAverageEffect.blendMode.setBlendFunction(Number(params.colorAverage["blend mode"]));

		});

		folder = menu.addFolder("Sepia");

		folder.add(params.sepia, "intensity").min(0.0).max(1.0).step(0.001).onChange(() => {

			sepiaEffect.uniforms.get("intensity").value = params.sepia.intensity;

		});

		folder.add(params.sepia, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			sepiaEffect.blendMode.opacity.value = params.sepia.opacity;

		});

		folder.add(params.sepia, "blend mode", BlendFunction).onChange(() => {

			sepiaEffect.blendMode.setBlendFunction(Number(params.sepia["blend mode"]));

		});

		folder = menu.addFolder("Brightness & Contrast");

		folder.add(params.brightnessContrast, "brightness").min(-1.0).max(1.0).step(0.001).onChange(() => {

			brightnessContrastEffect.uniforms.get("brightness").value = params.brightnessContrast.brightness;

		});

		folder.add(params.brightnessContrast, "contrast").min(-1.0).max(1.0).step(0.001).onChange(() => {

			brightnessContrastEffect.uniforms.get("contrast").value = params.brightnessContrast.contrast;

		});

		folder.add(params.brightnessContrast, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			brightnessContrastEffect.blendMode.opacity.value = params.brightnessContrast.opacity;

		});

		folder.add(params.brightnessContrast, "blend mode", BlendFunction).onChange(() => {

			brightnessContrastEffect.blendMode.setBlendFunction(Number(params.brightnessContrast["blend mode"]));

		});

		folder = menu.addFolder("Hue & Saturation");

		folder.add(params.hueSaturation, "hue").min(-Math.PI).max(Math.PI).step(0.001).onChange(() => {

			hueSaturationEffect.setHue(params.hueSaturation.hue);

		});

		folder.add(params.hueSaturation, "saturation").min(-1.0).max(1.0).step(0.001).onChange(() => {

			hueSaturationEffect.uniforms.get("saturation").value = params.hueSaturation.saturation;

		});

		folder.add(params.hueSaturation, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			hueSaturationEffect.blendMode.opacity.value = params.hueSaturation.opacity;

		});

		folder.add(params.hueSaturation, "blend mode", BlendFunction).onChange(() => {

			hueSaturationEffect.blendMode.setBlendFunction(Number(params.hueSaturation["blend mode"]));

		});

		folder.open();

		menu.add(pass, "dithering");

	}

}
