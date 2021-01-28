import {
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	SphereBufferGeometry,
	Vector3
} from "three";

import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	EdgeDetectionMode,
	EffectPass,
	ShockWaveEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A shock wave demo setup.
 */

export class ShockWaveDemo extends PostProcessingDemo {

	/**
	 * Constructs a new shock wave demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("shock-wave", composer);

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
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
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
		camera.position.set(-8, 1, -0.25);
		this.camera = camera;

		// Controls

		const target = new Vector3(-0.5, 3, -0.25);
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

		const geometry = new SphereBufferGeometry(1, 64, 64);
		const material = new MeshBasicMaterial({
			color: 0x000000,
			transparent: true,
			opacity: 0.25
		});

		const mesh = new Mesh(geometry, material);
		mesh.position.copy(target);
		scene.add(mesh);

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const shockWaveEffect = new ShockWaveEffect(camera, mesh.position, {
			speed: 1.25,
			maxRadius: 0.5,
			waveSize: 0.2,
			amplitude: 0.05
		});

		const effectPass = new EffectPass(camera, shockWaveEffect);
		const smaaPass = new EffectPass(camera, smaaEffect);

		this.effect = shockWaveEffect;

		composer.addPass(effectPass);
		composer.addPass(smaaPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effect = this.effect;
		const uniforms = effect.uniforms;

		const params = {
			"size": uniforms.get("size").value,
			"extent": uniforms.get("maxRadius").value,
			"waveSize": uniforms.get("waveSize").value,
			"amplitude": uniforms.get("amplitude").value
		};

		menu.add(effect, "speed").min(0.0).max(10.0).step(0.001);

		menu.add(params, "size").min(0.01).max(2.0).step(0.001).onChange((value) => {

			uniforms.get("size").value = value;

		});

		menu.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange((value) => {

			uniforms.get("maxRadius").value = value;

		});

		menu.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange((value) => {

			uniforms.get("waveSize").value = value;

		});

		menu.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange((value) => {

			uniforms.get("amplitude").value = value;

		});

		menu.add(effect, "explode");

	}

}
