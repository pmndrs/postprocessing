import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";
import { EffectPass, ShockWaveEffect, SMAAEffect } from "../../../src";

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
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space3/";
		const format = ".jpg";
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
		camera.position.set(5, 1, 5);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x666666);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const geometry = new SphereBufferGeometry(1, 64, 64);
		const material = new MeshBasicMaterial({
			color: 0xffff00,
			envMap: assets.get("sky")
		});

		const mesh = new Mesh(geometry, material);
		scene.add(mesh);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));

		const shockWaveEffect = new ShockWaveEffect(camera, mesh.position, {
			speed: 1.25,
			maxRadius: 0.5,
			waveSize: 0.2,
			amplitude: 0.05
		});

		const effectPass = new EffectPass(camera, shockWaveEffect);
		const smaaPass = new EffectPass(camera, smaaEffect);

		this.renderPass.renderToScreen = false;
		smaaPass.renderToScreen = true;

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

		menu.add(params, "size").min(0.01).max(2.0).step(0.001).onChange(() => {

			uniforms.get("size").value = params.size;

		});

		menu.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange(() => {

			uniforms.get("maxRadius").value = params.extent;

		});

		menu.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange(() => {

			uniforms.get("waveSize").value = params.waveSize;

		});

		menu.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange(() => {

			uniforms.get("amplitude").value = params.amplitude;

		});

		menu.add(effect, "explode");

	}

}
