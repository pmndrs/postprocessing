import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	OrbitControls,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { Demo } from "three-demo";
import { FilmPass } from "../../../src";

/**
 * A film demo setup.
 */

export class FilmDemo extends Demo {

	/**
	 * Constructs a new film demo.
	 */

	constructor() {

		super("film");

		/**
		 * A film pass.
		 *
		 * @type {FilmPass}
		 * @private
		 */

		this.filmPass = null;

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
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space/";
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
		camera.position.set(10, 1, 10);
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

		// Random objects.

		const object = new Object3D();
		const geometry = new SphereBufferGeometry(1, 4, 4);

		let material, mesh;
		let i;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				flatShading: true
			});

			mesh = new Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 10);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.multiplyScalar(Math.random());
			object.add(mesh);

		}

		this.object = object;
		scene.add(object);

		// Passes.

		const pass = new FilmPass({
			grayscale: false,
			sepia: true,
			vignette: true,
			eskil: true,
			scanlines: true,
			noise: true,
			noiseIntensity: 0.5,
			scanlineIntensity: 0.5,
			scanlineDensity: 1.5,
			greyscaleIntensity: 1.0,
			sepiaIntensity: 0.5,
			vignetteOffset: 1.0,
			vignetteDarkness: 1.0
		});

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.filmPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		const object = this.object;
		const twoPI = 2.0 * Math.PI;

		object.rotation.x += 0.001;
		object.rotation.y += 0.005;

		if(object.rotation.x >= twoPI) {

			object.rotation.x -= twoPI;

		}

		if(object.rotation.y >= twoPI) {

			object.rotation.y -= twoPI;

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const composer = this.composer;
		const pass = this.filmPass;

		const params = {
			"greyscale": pass.material.defines.GREYSCALE !== undefined,
			"sepia": pass.material.defines.SEPIA !== undefined,
			"vignette": pass.material.defines.VIGNETTE !== undefined,
			"eskil": pass.material.defines.ESKIL !== undefined,
			"noise": pass.material.defines.NOISE !== undefined,
			"scanlines": pass.material.defines.SCANLINES !== undefined,
			"noise intensity": pass.material.uniforms.noiseIntensity.value,
			"scanlines intensity": pass.material.uniforms.scanlineIntensity.value,
			"scanlines count": pass.scanlineDensity,
			"blend mode": "screen",
			"greyscale intensity": pass.material.uniforms.greyscaleIntensity.value,
			"sepia intensity": pass.material.uniforms.sepiaIntensity.value,
			"vignette offset": pass.material.uniforms.vignetteOffset.value,
			"vignette darkness": pass.material.uniforms.vignetteDarkness.value
		};

		let f = menu.addFolder("Greyscale");

		f.add(params, "greyscale").onChange(function() {

			pass.material.setGreyscaleEnabled(params.greyscale);

		});

		f.add(params, "greyscale intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.greyscaleIntensity.value = params["greyscale intensity"];

		});

		f.open();

		f = menu.addFolder("Noise and scanlines");

		f.add(params, "blend mode", ["add", "screen"]).onChange(function() {

			pass.material.setScreenModeEnabled(params["blend mode"] !== "add");

		});

		f.add(params, "noise").onChange(function() {

			pass.material.setNoiseEnabled(params.noise);

		});

		f.add(params, "noise intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.noiseIntensity.value = params["noise intensity"];

		});

		f.add(params, "scanlines").onChange(function() {

			pass.material.setScanlinesEnabled(params.scanlines);

		});

		f.add(params, "scanlines intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.scanlineIntensity.value = params["scanlines intensity"];

		});

		f.add(params, "scanlines count").min(0.0).max(2.0).step(0.01).onChange(function() {

			pass.scanlineDensity = params["scanlines count"]; composer.setSize();

		});

		f.open();

		f = menu.addFolder("Sepia");

		f.add(params, "sepia").onChange(function() {

			pass.material.setSepiaEnabled(params.sepia);

		});

		f.add(params, "sepia intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.sepiaIntensity.value = params["sepia intensity"];

		});

		f.open();

		f = menu.addFolder("Vignette");

		f.add(params, "vignette").onChange(function() {

			pass.material.setVignetteEnabled(params.vignette);

		});

		f.add(params, "eskil").onChange(function() {

			pass.material.setEskilEnabled(params.eskil);

		});

		f.add(params, "vignette offset").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.vignetteOffset.value = params["vignette offset"];

		});

		f.add(params, "vignette darkness").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.vignetteDarkness.value = params["vignette darkness"];

		});

		f.open();

	}

}
