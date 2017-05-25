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

import {
	BlurPass,
	CombineMaterial,
	KernelSize,
	RenderPass,
	SavePass,
	ShaderPass
} from "../../src";

import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A blur demo setup.
 */

export class BlurDemo extends Demo {

	/**
	 * Constructs a new blur demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = null;

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
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/sunset/";
		const format = ".png";
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
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(-15, 0, -15);
		camera.lookAt(this.controls.target);

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

		let pass = new RenderPass(scene, camera);
		this.renderPass = pass;
		composer.addPass(pass);

		pass = new SavePass();
		this.savePass = pass;
		composer.addPass(pass);

		pass = new BlurPass();
		this.blurPass = pass;
		composer.addPass(pass);

		pass = new ShaderPass(new CombineMaterial(), "texture1");
		pass.material.uniforms.texture2.value = this.savePass.renderTarget.texture;
		pass.material.uniforms.opacity1.value = 1.0;
		pass.material.uniforms.opacity2.value = 0.0;
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
		const renderPass = this.renderPass;
		const blurPass = this.blurPass;
		const combinePass = this.combinePass;

		const params = {
			"enabled": blurPass.enabled,
			"resolution": blurPass.resolutionScale,
			"kernel size": blurPass.kernelSize,
			"strength": combinePass.material.uniforms.opacity1.value
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { blurPass.resolutionScale = params.resolution; composer.setSize(); });
		gui.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() { blurPass.kernelSize = params["kernel size"]; });

		gui.add(params, "strength").min(0.0).max(1.0).step(0.01).onChange(function() {

			combinePass.material.uniforms.opacity1.value = params.strength;
			combinePass.material.uniforms.opacity2.value = 1.0 - params.strength;

		});

		gui.add(params, "enabled").onChange(function() {

			renderPass.renderToScreen = !params.enabled;
			blurPass.enabled = params.enabled;
			combinePass.enabled = params.enabled;

		});

	}

}
