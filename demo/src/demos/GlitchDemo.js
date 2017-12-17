import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	NearestFilter,
	Object3D,
	OrbitControls,
	PerspectiveCamera,
	SphereBufferGeometry,
	TextureLoader
} from "three";

import { Demo } from "three-demo";
import { GlitchMode, GlitchPass } from "../../../src";

/**
 * A glitch demo setup.
 */

export class GlitchDemo extends Demo {

	/**
	 * Constructs a new glitch demo.
	 */

	constructor() {

		super("glitch");

		/**
		 * A glitch pass.
		 *
		 * @type {GlitchPass}
		 * @private
		 */

		this.glitchPass = null;

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

		const path = "textures/skies/space4/";
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

				textureLoader.load("textures/perturb.jpg", function(texture) {

					texture.magFilter = texture.minFilter = NearestFilter;
					assets.set("perturb-map", texture);

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
		camera.position.set(6, 1, 6);
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

		const pass = new GlitchPass({
			perturbMap: assets.get("perturb-map")
		});

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.glitchPass = pass;
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

		const pass = this.glitchPass;
		const perturbMap = pass.perturbMap;

		const params = {
			"mode": pass.mode,
			"custom noise": true
		};

		menu.add(params, "mode").min(GlitchMode.SPORADIC).max(GlitchMode.CONSTANT_WILD).step(1).onChange(function() {

			pass.mode = params.mode;

		});

		menu.add(params, "custom noise").onChange(function() {

			if(params["custom noise"]) {

				pass.perturbMap = perturbMap;

			} else {

				pass.generatePerturbMap(64);

			}

		});

	}

}
