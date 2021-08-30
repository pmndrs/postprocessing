import { Color, PerspectiveCamera } from "three";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	EdgeDetectionMode,
	EffectPass,
	PixelationEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A pixelation demo.
 */

export class PixelationDemo extends PostProcessingDemo {

	/**
	 * Constructs a new pixelation demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("pixelation", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

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
		controls.setPosition(-9, 0.5, 0);
		controls.lookAt(0, 3, -3.5);
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

		const pixelationEffect = new PixelationEffect(5);

		const effectPass = new EffectPass(camera, pixelationEffect);
		const smaaPass = new EffectPass(camera, smaaEffect);

		this.effect = pixelationEffect;

		composer.addPass(smaaPass);
		composer.addPass(effectPass);

	}

	registerOptions(menu) {

		const effect = this.effect;

		const params = {
			"granularity": effect.getGranularity()
		};

		menu.add(params, "granularity", 0, 50, 1).onChange((value) => {

			effect.setGranularity(value);

		});

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

}
