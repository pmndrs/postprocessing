import { Color, PerspectiveCamera } from "three";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
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
 * A tone mapping demo.
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
		 * @type {ToneMappingEffect}
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

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer()
			.capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

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

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.getRenderer();
		const domElement = renderer.domElement;

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
		controls.setPosition(-5.15, 8.1, -0.95);
		controls.lookAt(-4.4, 8.6, -0.5);
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

	registerOptions(menu) {

		const renderer = this.composer.getRenderer();
		const effect = this.effect;
		const blendMode = effect.blendMode;
		const adaptiveLuminancePass = effect.adaptiveLuminancePass;
		const adaptiveLuminanceMaterial = adaptiveLuminancePass.fullscreenMaterial;

		const params = {
			"mode": effect.mode,
			"exposure": renderer.toneMappingExposure,
			"resolution": effect.resolution,
			"white point": effect.whitePoint,
			"middle grey": effect.middleGrey,
			"average lum": effect.averageLuminance,
			"min lum": adaptiveLuminanceMaterial.minLuminance,
			"adaptation rate": adaptiveLuminanceMaterial.adaptationRate,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "mode", ToneMappingMode).onChange((value) => {

			effect.mode = Number(value);

		});

		menu.add(params, "exposure", 0.0, 2.0, 0.001).onChange((value) => {

			renderer.toneMappingExposure = value;

		});

		let f = menu.addFolder("Reinhard (Modified)");

		f.add(params, "white point", 2.0, 32.0, 0.01).onChange((value) => {

			effect.whitePoint = value;

		});

		f.add(params, "middle grey", 0.0, 1.0, 0.0001).onChange((value) => {

			effect.middleGrey = value;

		});

		f.add(params, "average lum", 0.0001, 1.0, 0.0001).onChange((value) => {

			effect.averageLuminance = value;

		});

		f.open();

		f = menu.addFolder("Reinhard (Adaptive)");

		f.add(params, "resolution", [64, 128, 256, 512]).onChange((value) => {

			effect.resolution = Number(value);

		});

		f.add(params, "adaptation rate", 0.001, 3.0, 0.001).onChange((value) => {

			adaptiveLuminanceMaterial.adaptationRate = value;

		});

		f.add(params, "min lum", 0.001, 1.0, 0.001).onChange((value) => {

			adaptiveLuminanceMaterial.uniforms.minLuminance.value = value;

		});

		f.open();

		menu.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

}
