import {
	ClampToEdgeWrapping,
	Color,
	LinearFilter,
	PerspectiveCamera,
	TextureLoader
} from "three";

import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	BrightnessContrastEffect,
	ColorAverageEffect,
	LUT3DEffect,
	EdgeDetectionMode,
	EffectPass,
	HueSaturationEffect,
	LookupTexture3D,
	LUT3dlLoader,
	LUTCubeLoader,
	RawImageData,
	SepiaEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A color grading demo.
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
		 * A collection that maps LUT IDs to file names.
		 *
		 * @type {Map<String, String>}
		 * @private
		 */

		this.luts = new Map([
			["neutral-2", null],
			["neutral-4", null],
			["neutral-8", null],
			["png/bleach-bypass", "png/bleach-bypass.png"],
			["png/candle-light", "png/candle-light.png"],
			["png/cool-contrast", "png/cool-contrast.png"],
			["png/warm-contrast", "png/warm-contrast.png"],
			["png/desaturated-fog", "png/desaturated-fog.png"],
			["png/evening", "png/evening.png"],
			["png/fall", "png/fall.png"],
			["png/filmic1", "png/filmic1.png"],
			["png/filmic2", "png/filmic2.png"],
			["png/matrix-green", "png/matrix-green.png"],
			["png/strong-amber", "png/strong-amber.png"],
			["3dl/cinematic", "3dl/presetpro-cinematic.3dl"],
			["cube/cinematic", "cube/presetpro-cinematic.cube"],
			["cube/django-25", "cube/django-25.cube"]
		]);

	}

	load() {

		const luts = this.luts;
		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const lut3dlLoader = new LUT3dlLoader(loadingManager);
		const lutCubeLoader = new LUTCubeLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer()
			.capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

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

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.getRenderer();
		const domElement = renderer.domElement;
		const capabilities = renderer.capabilities;

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
		const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
		this.camera = camera;

		// Controls

		const { position, quaternion } = camera;
		const controls = new SpatialControls(position, quaternion, domElement);
		const settings = controls.settings;
		settings.rotation.setSensitivity(2.2);
		settings.rotation.setDamping(0.05);
		settings.translation.setSensitivity(3.0);
		settings.translation.setDamping(0.1);
		controls.setPosition(-9, 0.5, 0);
		controls.lookAt(0, 3, -3.5);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xeeeeee);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		// LUT Preview

		const img = document.createElement("img");
		img.title = "This is a compressed preview image";
		img.classList.add("lut", "hidden");
		document.body.append(img);

		// Passes

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

		const lutNeutral2 = LookupTexture3D.createNeutral(2);
		lutNeutral2.name = "neutral-2";
		assets.set(lutNeutral2.name, lutNeutral2);

		const lutNeutral4 = LookupTexture3D.createNeutral(4);
		lutNeutral4.name = "neutral-4";
		assets.set(lutNeutral4.name, lutNeutral4);

		const lutNeutral8 = LookupTexture3D.createNeutral(8);
		lutNeutral8.name = "neutral-8";
		assets.set(lutNeutral8.name, lutNeutral8);

		const lut = LookupTexture3D.from(assets.get("png/filmic1"));
		const lutEffect = capabilities.isWebGL2 ? new LUT3DEffect(lut) :
			new LUT3DEffect(lut.convertToUint8().toDataTexture());

		// lutEffect.setInputEncoding(LinearEncoding); // Debug

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

	registerOptions(menu) {

		const renderer = this.composer.getRenderer();
		const context = renderer.getContext();
		const capabilities = renderer.capabilities;
		const assets = this.assets;
		const luts = this.luts;

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
				"base size": lutEffect.getLUT().image.width,
				"3D texture": true,
				"tetrahedral filter": false,
				"scale up": false,
				"target size": 48,
				"show LUT": false,
				"opacity": lutEffect.blendMode.opacity.value,
				"blend mode": lutEffect.blendMode.blendFunction
			}
		};

		let objectURL = null;

		const img = document.querySelector(".lut");
		img.addEventListener("load", () => URL.revokeObjectURL(objectURL));

		function updateLUTPreview() {

			if(params.lut["show LUT"]) {

				// This is pretty fast.
				const lut = LookupTexture3D.from(lutEffect.getLUT());
				const { image } = lut.convertToUint8().toDataTexture();
				const rawImageData = RawImageData.from(image);

				// This takes a while if the image is large.
				rawImageData.toCanvas().toBlob((blob) => {

					objectURL = URL.createObjectURL(blob);
					img.src = objectURL;
					img.classList.remove("hidden");

				});

			} else {

				img.classList.add("hidden");

			}

		}

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
				params.lut["base size"] = size;

				if(capabilities.isWebGL2) {

					if(context.getExtension("OES_texture_float_linear") === null) {

						console.log("Linear float filtering not supported, " +
							"converting to Uint8");

						lut.convertToUint8();

					}

					lutEffect.setLUT(params.lut["3D texture"] ?
						lut : lut.toDataTexture());

				} else {

					lutEffect.setLUT(lut.convertToUint8().toDataTexture());

				}

				updateLUTPreview();

			}).catch((error) => console.error(error));

		}

		const infoOptions = [];

		let f = menu.addFolder("Color Average");

		f.add(params.colorAverage, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			colorAverageEffect.blendMode.opacity.value = value;

		});

		f.add(params.colorAverage, "blend mode", BlendFunction)
			.onChange((value) => {

				colorAverageEffect.blendMode.setBlendFunction(Number(value));

			});

		f = menu.addFolder("Sepia");

		f.add(params.sepia, "intensity", 0.0, 1.0, 0.001).onChange((value) => {

			sepiaEffect.uniforms.get("intensity").value = value;

		});

		f.add(params.sepia, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			sepiaEffect.blendMode.opacity.value = value;

		});

		f.add(params.sepia, "blend mode", BlendFunction).onChange((value) => {

			sepiaEffect.blendMode.setBlendFunction(Number(value));

		});

		f = menu.addFolder("Brightness & Contrast");

		f.add(params.brightnessContrast, "brightness", -1.0, 1.0, 0.001)
			.onChange((value) => {

				brightnessContrastEffect.uniforms.get("brightness").value = value;

			});

		f.add(params.brightnessContrast, "contrast", -1.0, 1.0, 0.001)
			.onChange((value) => {

				brightnessContrastEffect.uniforms.get("contrast").value = value;

			});

		f.add(params.brightnessContrast, "opacity", 0.0, 1.0, 0.01)
			.onChange((value) => {

				brightnessContrastEffect.blendMode.opacity.value = value;

			});

		f.add(params.brightnessContrast, "blend mode", BlendFunction)
			.onChange((value) => {

				brightnessContrastEffect.blendMode.setBlendFunction(Number(value));

			});

		f = menu.addFolder("Hue & Saturation");

		f.add(params.hueSaturation, "hue", 0.0, Math.PI * 2.0, 0.001)
			.onChange((value) => {

				hueSaturationEffect.setHue(value);

			});

		f.add(params.hueSaturation, "saturation", -1.0, 1.0, 0.001)
			.onChange((value) => {

				hueSaturationEffect.uniforms.get("saturation").value = value;

			});

		f.add(params.hueSaturation, "opacity", 0.0, 1.0, 0.01)
			.onChange((value) => {

				hueSaturationEffect.blendMode.opacity.value = value;

			});

		f.add(params.hueSaturation, "blend mode", BlendFunction)
			.onChange((value) => {

				hueSaturationEffect.blendMode.setBlendFunction(Number(value));

			});

		f = menu.addFolder("Lookup Texture 3D");

		f.add(params.lut, "LUT", [...luts.keys()]).onChange(changeLUT);

		infoOptions.push(f.add(params.lut, "base size").listen());

		if(capabilities.isWebGL2) {

			f.add(params.lut, "3D texture").onChange(changeLUT);
			f.add(params.lut, "tetrahedral filter").onChange((value) => {

				lutEffect.setTetrahedralInterpolationEnabled(value);

			});

		}

		f.add(params.lut, "scale up").onChange(changeLUT);
		f.add(params.lut, "target size", [32, 48, 64, 96, 128]).onChange(changeLUT);
		f.add(params.lut, "show LUT").onChange(updateLUTPreview);

		f.add(params.lut, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			lutEffect.blendMode.opacity.value = value;

		});

		f.add(params.lut, "blend mode", BlendFunction).onChange((value) => {

			lutEffect.blendMode.setBlendFunction(Number(value));

		});

		f.open();

		for(const option of infoOptions) {

			option.domElement.style.pointerEvents = "none";

		}

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

	dispose() {

		const img = document.querySelector(".lut");

		if(img !== null) {

			img.remove();

		}

	}

}
