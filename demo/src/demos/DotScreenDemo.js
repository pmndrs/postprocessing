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
import { DotScreenPass } from "../../../src";

/**
 * A dot screen demo setup.
 */

export class DotScreenDemo extends Demo {

	/**
	 * Constructs a new dot screen demo.
	 */

	constructor() {

		super("dot-screen");

		/**
		 * A dot screen pass.
		 *
		 * @type {DotScreenPass}
		 * @private
		 */

		this.dotScreenPass = null;

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

		const pass = new DotScreenPass({
			scale: 0.8,
			angle: Math.PI * 0.5,
			intensity: 0.25
		});

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.dotScreenPass = pass;
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

		const pass = this.dotScreenPass;

		const params = {
			"average": pass.material.defines.AVERAGE !== undefined,
			"scale": pass.material.uniforms.scale.value,
			"angle": pass.material.uniforms.angle.value,
			"intensity": pass.material.uniforms.intensity.value,
			"center X": pass.material.uniforms.offsetRepeat.value.x,
			"center Y": pass.material.uniforms.offsetRepeat.value.y
		};

		menu.add(params, "average").onChange(function() {

			pass.material.setAverageEnabled(params.average);

		});

		menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.scale.value = params.scale;

		});

		menu.add(params, "angle").min(0.0).max(Math.PI).step(0.001).onChange(function() {

			pass.material.uniforms.angle.value = params.angle;

		});

		menu.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.intensity.value = params.intensity;

		});

		const f = menu.addFolder("Center");

		f.add(params, "center X").min(-1.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.offsetRepeat.value.x = params["center X"];

		});

		f.add(params, "center Y").min(-1.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.offsetRepeat.value.y = params["center Y"];

		});

	}

}
