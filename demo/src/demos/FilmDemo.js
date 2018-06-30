import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";
import { FilmPass } from "../../../src";

/**
 * A film demo setup.
 */

export class FilmDemo extends PostProcessingDemo {

	/**
	 * Constructs a new film demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("film", composer);

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
			grid: false,
			noise: true,
			noiseIntensity: 0.5,
			scanlineIntensity: 0.5,
			gridIntensity: 0.2,
			scanlineDensity: 1.5,
			gridScale: 1.25,
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
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

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

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const composer = this.composer;
		const pass = this.filmPass;
		const material = pass.getFullscreenMaterial();
		const uniforms = material.uniforms;

		const params = {
			"greyscale": material.defines.GREYSCALE !== undefined,
			"sepia": material.defines.SEPIA !== undefined,
			"vignette": material.defines.VIGNETTE !== undefined,
			"eskil": material.defines.ESKIL !== undefined,
			"noise": material.defines.NOISE !== undefined,
			"scanlines": material.defines.SCANLINES !== undefined,
			"grid": material.defines.GRID !== undefined,
			"noise intensity": uniforms.noiseIntensity.value,
			"scanlines intensity": uniforms.scanlineIntensity.value,
			"grid intensity": uniforms.gridIntensity.value,
			"scanlines count": pass.scanlineDensity,
			"grid scale": pass.gridScale,
			"grid line width": pass.gridLineWidth,
			"blend mode": "screen",
			"greyscale intensity": uniforms.greyscaleIntensity.value,
			"sepia intensity": uniforms.sepiaIntensity.value,
			"vignette offset": uniforms.vignetteOffset.value,
			"vignette darkness": uniforms.vignetteDarkness.value
		};

		let f = menu.addFolder("Greyscale");

		f.add(params, "greyscale").onChange(() => {

			material.setGreyscaleEnabled(params.greyscale);

		});

		f.add(params, "greyscale intensity").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.greyscaleIntensity.value = params["greyscale intensity"];

		});

		f = menu.addFolder("Noise, Scanlines and Grid");

		f.add(params, "blend mode", ["add", "screen"]).onChange(() => {

			material.setScreenModeEnabled(params["blend mode"] !== "add");

		});

		f.add(params, "noise").onChange(() => {

			material.setNoiseEnabled(params.noise);

		});

		f.add(params, "noise intensity").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.noiseIntensity.value = params["noise intensity"];

		});

		f.add(params, "scanlines").onChange(() => {

			material.setScanlinesEnabled(params.scanlines);

		});

		f.add(params, "scanlines intensity").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.scanlineIntensity.value = params["scanlines intensity"];

		});

		f.add(params, "scanlines count").min(0.0).max(2.0).step(0.01).onChange(() => {

			pass.scanlineDensity = params["scanlines count"]; composer.setSize();

		});

		f.add(params, "grid").onChange(() => {

			material.setGridEnabled(params.grid);

		});

		f.add(params, "grid intensity").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.gridIntensity.value = params["grid intensity"];

		});

		f.add(params, "grid scale").min(0.01).max(2.0).step(0.01).onChange(() => {

			pass.gridScale = params["grid scale"]; composer.setSize();

		});

		f.add(params, "grid line width").min(0.0).max(1.0).step(0.001).onChange(() => {

			pass.gridLineWidth = params["grid line width"]; composer.setSize();

		});

		f = menu.addFolder("Sepia");

		f.add(params, "sepia").onChange(() => {

			material.setSepiaEnabled(params.sepia);

		});

		f.add(params, "sepia intensity").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.sepiaIntensity.value = params["sepia intensity"];

		});

		f = menu.addFolder("Vignette");

		f.add(params, "vignette").onChange(() => {

			material.setVignetteEnabled(params.vignette);

		});

		f.add(params, "eskil").onChange(() => {

			material.setEskilEnabled(params.eskil);

		});

		f.add(params, "vignette offset").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.vignetteOffset.value = params["vignette offset"];

		});

		f.add(params, "vignette darkness").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.vignetteDarkness.value = params["vignette darkness"];

		});

	}

}
