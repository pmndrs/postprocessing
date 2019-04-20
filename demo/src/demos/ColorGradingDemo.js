import { CubeTextureLoader, PerspectiveCamera } from "three";
import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	BrightnessContrastEffect,
	ColorAverageEffect,
	EffectPass,
	GammaCorrectionEffect,
	HueSaturationEffect,
	SepiaEffect,
	SMAAEffect
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
		 * A gamma correction effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.gammaCorrectionEffect = null;

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
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/sunset/";
		const format = ".png";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onError = reject;
				loadingManager.onProgress = (item, loaded, total) => {

					if(loaded === total) {

						resolve();

					}

				};

				cubeTextureLoader.load(urls, function(textureCube) {

					assets.set("sky", textureCube);

				});

				this.loadSMAAImages();

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
		const renderer = composer.renderer;

		// Camera.

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(-0.75, -0.1, -1);
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

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));

		const colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);
		const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.SKIP });

		const brightnessContrastEffect = new BrightnessContrastEffect({ contrast: 0.25 });
		const gammaCorrectionEffect = new GammaCorrectionEffect({ gamma: 0.65 });
		const hueSaturationEffect = new HueSaturationEffect({ saturation: -0.375 });

		const pass = new EffectPass(camera,
			smaaEffect,
			colorAverageEffect,
			sepiaEffect,
			brightnessContrastEffect,
			gammaCorrectionEffect,
			hueSaturationEffect
		);

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		pass.dithering = true;

		this.brightnessContrastEffect = brightnessContrastEffect;
		this.colorAverageEffect = colorAverageEffect;
		this.gammaCorrectionEffect = gammaCorrectionEffect;
		this.hueSaturationEffect = hueSaturationEffect;
		this.sepiaEffect = sepiaEffect;

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

		const brightnessContrastEffect = this.brightnessContrastEffect;
		const colorAverageEffect = this.colorAverageEffect;
		const gammaCorrectionEffect = this.gammaCorrectionEffect;
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
			gammaCorrection: {
				"gamma": gammaCorrectionEffect.uniforms.get("gamma").value,
				"opacity": gammaCorrectionEffect.blendMode.opacity.value,
				"blend mode": gammaCorrectionEffect.blendMode.blendFunction
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

			colorAverageEffect.blendMode.blendFunction = Number.parseInt(params.colorAverage["blend mode"]);
			pass.recompile();

		});

		folder = menu.addFolder("Sepia");

		folder.add(params.sepia, "intensity").min(0.0).max(4.0).step(0.001).onChange(() => {

			sepiaEffect.uniforms.get("intensity").value = params.sepia.intensity;

		});

		folder.add(params.sepia, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			sepiaEffect.blendMode.opacity.value = params.sepia.opacity;

		});

		folder.add(params.sepia, "blend mode", BlendFunction).onChange(() => {

			sepiaEffect.blendMode.blendFunction = Number.parseInt(params.sepia["blend mode"]);
			pass.recompile();

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

			brightnessContrastEffect.blendMode.blendFunction = Number.parseInt(params.brightnessContrast["blend mode"]);
			pass.recompile();

		});

		folder.open();

		folder = menu.addFolder("Gamma Correction");

		folder.add(params.gammaCorrection, "gamma").min(0.01).max(1.5).step(0.001).onChange(() => {

			gammaCorrectionEffect.uniforms.get("gamma").value = params.gammaCorrection.gamma;

		});

		folder.add(params.gammaCorrection, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			gammaCorrectionEffect.blendMode.opacity.value = params.gammaCorrection.opacity;

		});

		folder.add(params.gammaCorrection, "blend mode", BlendFunction).onChange(() => {

			gammaCorrectionEffect.blendMode.blendFunction = Number.parseInt(params.gammaCorrection["blend mode"]);
			pass.recompile();

		});

		folder.open();

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

			hueSaturationEffect.blendMode.blendFunction = Number.parseInt(params.hueSaturation["blend mode"]);
			pass.recompile();

		});

		folder.open();

		menu.add(pass, "dithering");

	}

}
