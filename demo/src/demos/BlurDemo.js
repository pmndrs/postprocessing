import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	PerspectiveCamera,
	sRGBEncoding
} from "three";

import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as SphereCloud from "./objects/SphereCloud";

import {
	BlurPass,
	EdgeDetectionMode,
	EffectPass,
	KernelSize,
	SavePass,
	SMAAEffect,
	SMAAPreset,
	SMAAImageLoader,
	TextureEffect
} from "../../../src";

/**
 * A blur demo setup.
 */

export class BlurDemo extends PostProcessingDemo {

	/**
	 * Constructs a new blur demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("blur", composer);

		/**
		 * A blur pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.blurPass = null;

		/**
		 * A texture pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.texturePass = null;

		/**
		 * A texture effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.textureEffect = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const path = "textures/skies/sunset/";
		const format = ".png";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

				cubeTextureLoader.load(urls, (t) => {

					t.encoding = sRGBEncoding;
					assets.set("sky", t);

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
		const camera = new PerspectiveCamera(50, aspect, 1, 2000);
		camera.position.set(-15, 0, -15);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls

		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Sky

		scene.background = assets.get("sky");

		// Lights

		const ambientLight = new AmbientLight(0x323232);
		const mainLight = new DirectionalLight(0xff7e66, 1.0);
		mainLight.position.set(1.44, 0.2, 2.0);

		scene.add(ambientLight);
		scene.add(mainLight);

		// Objects

		this.object = SphereCloud.create();
		scene.add(this.object);

		// Passes

		const savePass = new SavePass();
		const blurPass = new BlurPass({
			height: 480
		});

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.LUMA
		);

		const textureEffect = new TextureEffect({
			texture: savePass.renderTarget.texture
		});

		const smaaPass = new EffectPass(camera, smaaEffect);
		const texturePass = new EffectPass(camera, textureEffect);

		textureEffect.blendMode.opacity.value = 0.0;

		this.blurPass = blurPass;
		this.texturePass = texturePass;
		this.textureEffect = textureEffect;

		composer.addPass(smaaPass);
		composer.addPass(savePass);
		composer.addPass(blurPass);
		composer.addPass(texturePass);

	}

	/**
	 * Update this demo.
	 *
	 * @param {Number} deltaTime - The time since the last frame in seconds.
	 */

	update(deltaTime) {

		const object = this.object;
		const PI2 = 2.0 * Math.PI;

		object.rotation.x += 0.05 * deltaTime;
		object.rotation.y += 0.25 * deltaTime;

		if(object.rotation.x >= PI2) {

			object.rotation.x -= PI2;

		}

		if(object.rotation.y >= PI2) {

			object.rotation.y -= PI2;

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const textureEffect = this.textureEffect;
		const texturePass = this.texturePass;
		const blurPass = this.blurPass;
		const blendMode = textureEffect.blendMode;

		const params = {
			"resolution": blurPass.height,
			"kernel size": blurPass.kernelSize,
			"scale": blurPass.scale,
			"opacity": 1.0 - blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {

			blurPass.resolution.height = Number(value);

		});

		menu.add(params, "kernel size", KernelSize).onChange((value) => {

			blurPass.kernelSize = Number(value);

		});

		menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blurPass.scale = Number(value);

		});

		menu.add(blurPass, "enabled");
		menu.add(texturePass, "dithering");

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blendMode.opacity.value = 1.0 - value;

		});

	}

}
