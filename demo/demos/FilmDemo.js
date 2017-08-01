import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { FilmPass, RenderPass } from "../../src";
import { Demo } from "./Demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A film demo setup.
 */

export class FilmDemo extends Demo {

	/**
	 * Constructs a new film demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

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
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space/";
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

					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

		} else {

			callback();

		}

	}

	/**
	 * Creates the scene.
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(10, 1, 10);
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

		// Random objects.

		const object = new Object3D();
		const geometry = new SphereBufferGeometry(1, 4, 4);

		let material, mesh;
		let i;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				shading: FlatShading
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

		composer.addPass(new RenderPass(scene, camera));

		const pass = new FilmPass({
			grayscale: false,
			sepia: false,
			vignette: false,
			eskil: false,
			scanlines: true,
			noise: true,
			noiseIntensity: 0.5,
			scanlineIntensity: 0.5,
			scanlineDensity: 1.5,
			greyscaleIntensity: 1.0,
			sepiaIntensity: 1.0,
			vignetteOffset: 0.0,
			vignetteDarkness: 0.5
		});

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

		if(object !== null) {

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const composer = this.composer;
		const pass = this.filmPass;

		const params = {
			"grayscale": pass.material.defines.GREYSCALE !== undefined,
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

		let f = gui.addFolder("Greyscale");

		f.add(params, "grayscale").onChange(function() {
			params.grayscale ? pass.material.defines.GREYSCALE = "1" : delete pass.material.defines.GREYSCALE;
			pass.material.needsUpdate = true;
		});

		f.add(params, "greyscale intensity").min(0.0).max(1.0).step(0.01).onChange(function() {
			pass.material.uniforms.greyscaleIntensity.value = params["greyscale intensity"];
		});

		f.open();

		f = gui.addFolder("Noise and scanlines");

		f.add(params, "blend mode", ["add", "screen"]).onChange(function() {

			if(params["blend mode"] === "add") {

				delete pass.material.defines.SCREEN_MODE;

			} else {

				pass.material.defines.SCREEN_MODE = "1";

			}

			pass.material.needsUpdate = true;

		});

		f.add(params, "noise").onChange(function() {
			params.noise ? pass.material.defines.NOISE = "1" : delete pass.material.defines.NOISE;
			pass.material.needsUpdate = true;
		});

		f.add(params, "noise intensity").min(0.0).max(1.0).step(0.01).onChange(function() {
			pass.material.uniforms.noiseIntensity.value = params["noise intensity"];
		});

		f.add(params, "scanlines").onChange(function() {
			params.scanlines ? pass.material.defines.SCANLINES = "1" : delete pass.material.defines.SCANLINES;
			pass.material.needsUpdate = true;
		});

		f.add(params, "scanlines intensity").min(0.0).max(1.0).step(0.01).onChange(function() {
			pass.material.uniforms.scanlineIntensity.value = params["scanlines intensity"];
		});

		f.add(params, "scanlines count").min(0.0).max(2.0).step(0.01).onChange(function() {
			pass.scanlineDensity = params["scanlines count"]; composer.setSize();
		});

		f.open();

		f = gui.addFolder("Sepia");

		f.add(params, "sepia").onChange(function() {
			params.sepia ? pass.material.defines.SEPIA = "1" : delete pass.material.defines.SEPIA;
			pass.material.needsUpdate = true;
		});

		f.add(params, "sepia intensity").min(0.0).max(1.0).step(0.01).onChange(function() {
			pass.material.uniforms.sepiaIntensity.value = params["sepia intensity"];
		});

		f.open();

		f = gui.addFolder("Vignette");

		f.add(params, "vignette").onChange(function() {
			params.vignette ? pass.material.defines.VIGNETTE = "1" : delete pass.material.defines.VIGNETTE;
			pass.material.needsUpdate = true;
		});

		f.add(params, "eskil").onChange(function() {
			params.eskil ? pass.material.defines.ESKIL = "1" : delete pass.material.defines.ESKIL;
			pass.material.needsUpdate = true;
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
