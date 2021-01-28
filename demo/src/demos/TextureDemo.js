import {
	Color,
	PerspectiveCamera,
	RepeatWrapping,
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
	EdgeDetectionMode,
	EffectPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect
} from "../../../src";

/**
 * A texture demo setup.
 */

export class TextureDemo extends PostProcessingDemo {

	/**
	 * Constructs a new texture demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("texture", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer().capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

				Sponza.load(assets, loadingManager, anisotropy);

				textureLoader.load("textures/scratches.jpg", (t) => {

					t.encoding = sRGBEncoding;
					t.wrapS = t.wrapT = RepeatWrapping;
					assets.set("scratches-color", t);

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
		const renderer = composer.getRenderer();

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 2000);
		camera.position.set(-9, 0.5, 0);
		this.camera = camera;

		// Controls

		const target = new Vector3(0, 3, -3.5);
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

		const textureEffect = new TextureEffect({
			blendFunction: BlendFunction.COLOR_DODGE,
			texture: assets.get("scratches-color")
		});

		const pass = new EffectPass(camera, smaaEffect, textureEffect);

		this.effect = textureEffect;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effect = this.effect;
		const blendMode = effect.blendMode;

		const offset = effect.texture.offset;
		const repeat = effect.texture.repeat;
		const center = effect.texture.center;

		const params = {
			"uv": {
				"enabled": effect.uvTransform
			},
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		const folder = menu.addFolder("UV Transformation");
		folder.add(params.uv, "enabled").onChange((value) => {

			effect.uvTransform = value;

		});

		folder.open();

		let subFolder = folder.addFolder("Offset");
		subFolder.add(offset, "x").min(0.0).max(1.0).step(0.001);
		subFolder.add(offset, "y").min(0.0).max(1.0).step(0.001);

		subFolder = folder.addFolder("Repeat");
		subFolder.add(repeat, "x").min(0.0).max(2.0).step(0.001);
		subFolder.add(repeat, "y").min(0.0).max(2.0).step(0.001);

		subFolder = folder.addFolder("Center");
		subFolder.add(center, "x").min(0.0).max(1.0).step(0.001);
		subFolder.add(center, "y").min(0.0).max(1.0).step(0.001);

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

	}

}
