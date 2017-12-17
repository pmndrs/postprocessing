import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	OrbitControls,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { Demo } from "three-demo";
import { ShockWavePass } from "../../../src";

/**
 * A shock wave demo setup.
 */

export class ShockWaveDemo extends Demo {

	/**
	 * Constructs a new shock wave demo.
	 */

	constructor(composer) {

		super("shock-wave");

		/**
		 * A shock wave pass.
		 *
		 * @type {ShockWavePass}
		 * @private
		 */

		this.shockWavePass = null;

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

		this.controls = new OrbitControls(camera, renderer.domElement);

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

		const pass = new ShockWavePass(camera, mesh.position, {
			speed: 1.0,
			maxRadius: 0.5,
			waveSize: 0.2,
			amplitude: 0.05
		});

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.shockWavePass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.shockWavePass;

		const params = {
			"speed": pass.speed,
			"size": pass.shockWaveMaterial.uniforms.size.value,
			"extent": pass.shockWaveMaterial.uniforms.maxRadius.value,
			"waveSize": pass.shockWaveMaterial.uniforms.waveSize.value,
			"amplitude": pass.shockWaveMaterial.uniforms.amplitude.value
		};

		menu.add(params, "speed").min(0.0).max(10.0).step(0.001).onChange(function() {

			pass.speed = params.speed;

		});

		menu.add(params, "size").min(0.01).max(2.0).step(0.001).onChange(function() {

			pass.shockWaveMaterial.uniforms.size.value = params.size;

		});

		menu.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange(function() {

			pass.shockWaveMaterial.uniforms.maxRadius.value = params.extent;

		});

		menu.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange(function() {

			pass.shockWaveMaterial.uniforms.waveSize.value = params.waveSize;

		});

		menu.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange(function() {

			pass.shockWaveMaterial.uniforms.amplitude.value = params.amplitude;

		});

		menu.add(pass, "explode");

	}

}
