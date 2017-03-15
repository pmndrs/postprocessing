import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { ShockWavePass, RenderPass } from "../src";
import { Demo } from "./demo.js";

/**
 * A shock wave demo setup.
 *
 * @class ShockWaveDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class ShockWaveDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A shock wave pass.
		 *
		 * @property shockWavePass
		 * @type ShockWavePass
		 * @private
		 */

		this.shockWavePass = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @method load
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space3/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		if(this.assets === null) {

			loadingManager.onProgress = (item, loaded, total) => {

				if(loaded === total) {

					this.assets = assets;
					this.initialise();
					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

		} else {

			this.initialise();
			callback();

		}

	}

	/**
	 * Creates the scene.
	 *
	 * @method initialise
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(5, 1, 5);
		camera.lookAt(this.controls.target);

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

		composer.addPass(new RenderPass(scene, camera));

		const pass = new ShockWavePass(camera, mesh.position, {
			speed: 2.0,
			maxRadius: 0.5,
			waveSize: 0.2,
			amplitude: 0.05
		});

		pass.renderToScreen = true;
		this.shockWavePass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const pass = this.shockWavePass;

		const params = {
			"speed": pass.speed,
			"size": pass.shockWaveMaterial.uniforms.size.value,
			"extent": pass.shockWaveMaterial.uniforms.maxRadius.value,
			"waveSize": pass.shockWaveMaterial.uniforms.waveSize.value,
			"amplitude": pass.shockWaveMaterial.uniforms.amplitude.value,
			"explode": function() { pass.explode(); }
		};

		gui.add(params, "speed").min(0.0).max(10.0).step(0.001).onChange(function() { pass.speed = params.speed; });
		gui.add(params, "size").min(0.01).max(2.0).step(0.001).onChange(function() { pass.shockWaveMaterial.uniforms.size.value = params.size; });
		gui.add(params, "extent").min(0.0).max(10.0).step(0.001).onChange(function() { pass.shockWaveMaterial.uniforms.maxRadius.value = params.extent; });
		gui.add(params, "waveSize").min(0.0).max(2.0).step(0.001).onChange(function() { pass.shockWaveMaterial.uniforms.waveSize.value = params.waveSize; });
		gui.add(params, "amplitude").min(0.0).max(0.25).step(0.001).onChange(function() { pass.shockWaveMaterial.uniforms.amplitude.value = params.amplitude; });
		gui.add(params, "explode");

	}

}
