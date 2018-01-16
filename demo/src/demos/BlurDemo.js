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
import { Demo } from "three-demo";

import {
	BlurPass,
	CombineMaterial,
	KernelSize,
	SavePass,
	ShaderPass
} from "../../../src";

/**
 * A blur demo setup.
 */

export class BlurDemo extends Demo {

	/**
	 * Constructs a new blur demo.
	 */

	constructor() {

		super("blur");

		/**
		 * A save pass.
		 *
		 * @type {SavePass}
		 * @private
		 */

		this.savePass = null;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = null;

		/**
		 * A combine pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.combinePass = null;

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
		camera.position.set(-15, 0, -15);
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

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Random objects.

		let object = new Object3D();

		let geometry = new SphereBufferGeometry(1, 4, 4);
		let material;
		let i, mesh;

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

		let pass = new SavePass();
		this.savePass = pass;
		composer.addPass(pass);

		pass = new BlurPass();
		this.blurPass = pass;
		composer.addPass(pass);

		pass = new ShaderPass(new CombineMaterial(), "texture1");
		pass.material.uniforms.texture2.value = this.savePass.renderTarget.texture;
		pass.material.uniforms.opacity1.value = 1.0;
		pass.material.uniforms.opacity2.value = 0.0;

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.combinePass = pass;
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
		const renderPass = this.renderPass;
		const blurPass = this.blurPass;
		const combinePass = this.combinePass;

		const params = {
			"enabled": blurPass.enabled,
			"resolution": blurPass.resolutionScale,
			"kernel size": blurPass.kernelSize,
			"strength": combinePass.material.uniforms.opacity1.value
		};

		menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() {

			blurPass.resolutionScale = params.resolution; composer.setSize();

		});

		menu.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() {

			blurPass.kernelSize = params["kernel size"];

		});

		menu.add(params, "strength").min(0.0).max(1.0).step(0.01).onChange(function() {

			combinePass.material.uniforms.opacity1.value = params.strength;
			combinePass.material.uniforms.opacity2.value = 1.0 - params.strength;

		});

		menu.add(blurPass, "dithering");

		menu.add(params, "enabled").onChange(function() {

			renderPass.renderToScreen = !params.enabled;
			blurPass.enabled = params.enabled;
			combinePass.enabled = params.enabled;

		});

	}

}
