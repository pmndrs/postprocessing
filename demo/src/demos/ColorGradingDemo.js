import {
	ClampToEdgeWrapping,
	Color,
	LinearFilter,
	PerspectiveCamera,
	RGBFormat,
	sRGBEncoding,
	TextureLoader,
	Vector3
} from "three";

import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	BrightnessContrastEffect,
	ColorAverageEffect,
	LUTEffect,
	EdgeDetectionMode,
	EffectPass,
	HueSaturationEffect,
	LookupTexture3D,
	LUT3dlLoader,
	LUTCubeLoader,
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
		 * A color grading effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.colorGradingEffect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

		/**
		 * A collection that maps LUT IDs to file names.
		 *
		 * @type {Map<String, String>}
		 * @private
		 */

		this.luts = new Map([
			["neutral", null],
			["bleach-bypass", "lut-bleach-bypass.png"],
			["candle-light", "lut-candle-light.png"],
			["cool-contrast", "lut-cool-contrast.png"],
			["warm-contrast", "lut-warm-contrast.png"],
			["desaturated-fog", "lut-desaturated-fog.png"],
			["evening", "lut-evening.png"],
			["fall", "lut-fall.png"],
			["filmic1", "lut-filmic1.png"],
			["filmic2", "lut-filmic2.png"],
			["filmic3", "lut-filmic3.png"],
			["filmic4", "lut-filmic4.png"],
			["filmic5", "lut-filmic5.png"],
			["filmic6", "lut-filmic6.png"],
			["filmic7", "lut-filmic7.png"],
			["filmic8", "lut-filmic8.png"],
			["filmic9", "lut-filmic9.png"],
			["matrix-blue", "lut-matrix-blue.png"],
			["matrix-green", "lut-matrix-green.png"],
			["night1", "lut-night1.png"],
			["night2", "lut-night2.png"],
			["night-dark", "lut-night-dark.png"],
			["cinematic-3dl", "lut-presetpro-cinematic.3dl"],
			["cinematic-cube", "lut-presetpro-cinematic.cube"]
		]);

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const luts = this.luts;
		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const lut3dlLoader = new LUT3dlLoader(loadingManager);
		const lutCubeLoader = new LUTCubeLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer().capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = reject;

				Sponza.load(assets, loadingManager, anisotropy);

				for(const entry of luts) {

					if(entry[1] === null) {

						continue;

					}

					if(/.3dl$/im.test(entry[1])) {

						lut3dlLoader.load(`textures/lut/${entry[1]}`, (t) => {

							t.name = entry[0];
							assets.set(entry[0], t);

						});

					} else if(/.cube$/im.test(entry[1])) {

						lutCubeLoader.load(`textures/lut/${entry[1]}`, (t) => {

							t.name = entry[0];
							assets.set(entry[0], t);

						});

					} else {

						textureLoader.load(`textures/lut/${entry[1]}`, (t) => {

							t.name = entry[0];
							t.format = RGBFormat;
							t.encoding = sRGBEncoding;
							t.generateMipmaps = false;
							t.minFilter = LinearFilter;
							t.magFilter = LinearFilter;
							t.wrapS = ClampToEdgeWrapping;
							t.wrapT = ClampToEdgeWrapping;
							t.flipY = false;

							assets.set(entry[0], t);

						});

					}

				}

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
		const capabilities = renderer.capabilities;

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

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const colorAverageEffect = new ColorAverageEffect(BlendFunction.SKIP);
		const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.SKIP });

		const brightnessContrastEffect = new BrightnessContrastEffect({
			blendFunction: BlendFunction.SKIP
		});

		const hueSaturationEffect = new HueSaturationEffect({
			blendFunction: BlendFunction.SKIP,
			saturation: 0.4,
			hue: 0.0
		});

		const lutNeutral = LookupTexture3D.createNeutral(32);
		lutNeutral.encoding = sRGBEncoding;
		assets.set(lutNeutral.name, lutNeutral);

		const lut = LookupTexture3D.from(assets.get("filmic1"));

		const lutEffect = capabilities.isWebGL2 ? new LUTEffect(lut) :
			new LUTEffect(lut.convertToUint8().toDataTexture());

		this.brightnessContrastEffect = brightnessContrastEffect;
		this.colorAverageEffect = colorAverageEffect;
		this.hueSaturationEffect = hueSaturationEffect;
		this.sepiaEffect = sepiaEffect;
		this.lutEffect = lutEffect;

		const pass = new EffectPass(camera,
			smaaEffect,
			colorAverageEffect,
			sepiaEffect,
			brightnessContrastEffect,
			hueSaturationEffect,
			lutEffect
		);

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const capabilities = this.composer.getRenderer().capabilities;
		const assets = this.assets;
		const luts = this.luts;
		const pass = this.pass;

		const brightnessContrastEffect = this.brightnessContrastEffect;
		const colorAverageEffect = this.colorAverageEffect;
		const hueSaturationEffect = this.hueSaturationEffect;
		const sepiaEffect = this.sepiaEffect;
		const lutEffect = this.lutEffect;

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
			},
			lut: {
				"LUT": lutEffect.getLUT().name,
				"scale up": false,
				"target size": 48,
				"opacity": lutEffect.blendMode.opacity.value,
				"blend mode": lutEffect.blendMode.blendFunction
			}
		};

		function changeLUT() {

			const original = assets.get(params.lut.LUT);
			const size = Math.min(original.image.width, original.image.height);
			const targetSize = params.lut["target size"];
			const scaleUp = params.lut["scale up"] && (targetSize > size);

			let promise;

			if(scaleUp) {

				const lut = original.isLookupTexture3D ? original :
					LookupTexture3D.from(original);

				console.time("Tetrahedral Upscaling");
				promise = lut.scaleUp(targetSize, false);
				document.body.classList.add("progress");

			} else {

				promise = Promise.resolve(LookupTexture3D.from(original));

			}

			promise.then((lut) => {

				if(scaleUp) {

					console.timeEnd("Tetrahedral Upscaling");
					document.body.classList.remove("progress");

				}

				lutEffect.getLUT().dispose();

				if(capabilities.isWebGL2) {

					lutEffect.setLUT(lut);

				} else {

					lutEffect.setLUT(lut.convertToUint8().toDataTexture());

				}

			}).catch((error) => console.error(error));

		}

		let f = menu.addFolder("Color Average");

		f.add(params.colorAverage, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			colorAverageEffect.blendMode.opacity.value = params.colorAverage.opacity;

		});

		f.add(params.colorAverage, "blend mode", BlendFunction).onChange(() => {

			colorAverageEffect.blendMode.setBlendFunction(Number(params.colorAverage["blend mode"]));

		});

		f = menu.addFolder("Sepia");

		f.add(params.sepia, "intensity").min(0.0).max(1.0).step(0.001).onChange(() => {

			sepiaEffect.uniforms.get("intensity").value = params.sepia.intensity;

		});

		f.add(params.sepia, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			sepiaEffect.blendMode.opacity.value = params.sepia.opacity;

		});

		f.add(params.sepia, "blend mode", BlendFunction).onChange(() => {

			sepiaEffect.blendMode.setBlendFunction(Number(params.sepia["blend mode"]));

		});

		f = menu.addFolder("Brightness & Contrast");

		f.add(params.brightnessContrast, "brightness").min(-1.0).max(1.0).step(0.001).onChange(() => {

			brightnessContrastEffect.uniforms.get("brightness").value = params.brightnessContrast.brightness;

		});

		f.add(params.brightnessContrast, "contrast").min(-1.0).max(1.0).step(0.001).onChange(() => {

			brightnessContrastEffect.uniforms.get("contrast").value = params.brightnessContrast.contrast;

		});

		f.add(params.brightnessContrast, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			brightnessContrastEffect.blendMode.opacity.value = params.brightnessContrast.opacity;

		});

		f.add(params.brightnessContrast, "blend mode", BlendFunction).onChange(() => {

			brightnessContrastEffect.blendMode.setBlendFunction(Number(params.brightnessContrast["blend mode"]));

		});

		f = menu.addFolder("Hue & Saturation");

		f.add(params.hueSaturation, "hue").min(0.0).max(Math.PI * 2.0).step(0.001).onChange(() => {

			hueSaturationEffect.setHue(params.hueSaturation.hue);

		});

		f.add(params.hueSaturation, "saturation").min(-1.0).max(1.0).step(0.001).onChange(() => {

			hueSaturationEffect.uniforms.get("saturation").value = params.hueSaturation.saturation;

		});

		f.add(params.hueSaturation, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			hueSaturationEffect.blendMode.opacity.value = params.hueSaturation.opacity;

		});

		f.add(params.hueSaturation, "blend mode", BlendFunction).onChange(() => {

			hueSaturationEffect.blendMode.setBlendFunction(Number(params.hueSaturation["blend mode"]));

		});

		f = menu.addFolder("Lookup Texture 3D");

		f.add(params.lut, "LUT", [...luts.keys()]).onChange(changeLUT);
		f.add(params.lut, "scale up").onChange(changeLUT);
		f.add(params.lut, "target size", [32, 48, 64, 80, 96, 112, 128]).onChange(changeLUT);

		f.add(params.lut, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			lutEffect.blendMode.opacity.value = params.lut.opacity;

		});

		f.add(params.lut, "blend mode", BlendFunction).onChange(() => {

			lutEffect.blendMode.setBlendFunction(Number(params.lut["blend mode"]));

		});

		f.open();

		menu.add(pass, "dithering");

	}

}
