import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	OrbitControls,
	PerspectiveCamera,
	RepeatWrapping,
	TextureLoader
} from "three";

import { Demo } from "three-demo";
import { ToneMappingPass } from "../../../src";

/**
 * A tone mapping demo setup.
 */

export class ToneMappingDemo extends Demo {

	/**
	 * Constructs a new tone mapping demo.
	 */

	constructor() {

		super("tone-mapping");

		/**
		 * A dot screen pass.
		 *
		 * @type {DotScreenPass}
		 * @private
		 */

		this.toneMappingPass = null;

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
		const textureLoader = new TextureLoader(loadingManager);
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/sunset/";
		const format = ".png";
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

				textureLoader.load("textures/crate.jpg", function(texture) {

					texture.wrapS = texture.wrapT = RepeatWrapping;
					assets.set("crate-color", texture);

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
		camera.position.set(-3, 0, -3);
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

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				map: assets.get("crate-color")
			})
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		const pass = new ToneMappingPass({
			adaptive: true,
			resolution: 256,
			distinction: 2.0
		});

		pass.adaptiveLuminosityMaterial.uniforms.tau.value = 2.0;

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		pass.dithering = true;
		this.toneMappingPass = pass;
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

		object.rotation.x += 0.0005;
		object.rotation.y += 0.001;

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

		const pass = this.toneMappingPass;

		const params = {
			"resolution": Math.log2(pass.resolution),
			"distinction": pass.luminosityMaterial.uniforms.distinction.value,
			"adaption rate": pass.adaptiveLuminosityMaterial.uniforms.tau.value,
			"average lum": pass.toneMappingMaterial.uniforms.averageLuminance.value,
			"min lum": pass.adaptiveLuminosityMaterial.uniforms.minLuminance.value,
			"max lum": pass.toneMappingMaterial.uniforms.maxLuminance.value,
			"middle grey": pass.toneMappingMaterial.uniforms.middleGrey.value
		};

		menu.add(params, "resolution").min(6).max(11).step(1).onChange(function() {

			pass.resolution = Math.pow(2, params.resolution);

		});

		menu.add(pass, "adaptive");
		menu.add(pass, "dithering");

		let f = menu.addFolder("Luminance");

		f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() {

			pass.luminosityMaterial.uniforms.distinction.value = params.distinction;

		});

		f.add(params, "adaption rate").min(1.0).max(3.0).step(0.01).onChange(function() {

			pass.adaptiveLuminosityMaterial.uniforms.tau.value = params["adaption rate"];

		});

		f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(function() {

			pass.toneMappingMaterial.uniforms.averageLuminance.value = params["average lum"];

		});

		f.add(params, "min lum").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.adaptiveLuminosityMaterial.uniforms.minLuminance.value = params["min lum"];

		});

		f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(function() {

			pass.toneMappingMaterial.uniforms.maxLuminance.value = params["max lum"];

		});

		f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.toneMappingMaterial.uniforms.middleGrey.value = params["middle grey"];

		});

		f.open();

	}

}
