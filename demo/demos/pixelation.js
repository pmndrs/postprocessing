import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	OrbitControls,
	Scene,
	SphereBufferGeometry
} from "three";

import {
	ClearMaskPass,
	CopyMaterial,
	MaskPass,
	PixelationPass,
	RenderPass,
	ShaderPass
} from "../src";

import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A pixelation demo setup.
 */

export class PixelationDemo extends Demo {

	/**
	 * Constructs a new pixelation demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

		/**
		 * An object used for masking.
		 *
		 * @type {Mesh}
		 * @private
		 */

		this.maskObject = null;

		/**
		 * A mask pass.
		 *
		 * @type {MaskPass}
		 * @private
		 */

		this.maskPass = null;

		/**
		 * A pixelation pass.
		 *
		 * @type {PixelationPass}
		 * @private
		 */

		this.pixelationPass = null;

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

		// Stencil mask scene.

		const maskScene = new Scene();

		mesh = new Mesh(new BoxBufferGeometry(4, 4, 4));
		this.maskObject = mesh;
		maskScene.add(mesh);

		// Passes.

		let pass = new RenderPass(scene, camera);
		composer.addPass(pass);

		pass = new MaskPass(maskScene, camera);
		this.maskPass = pass;
		composer.addPass(pass);

		pass = new PixelationPass(5.0);
		this.pixelationPass = pass;
		composer.addPass(pass);

		composer.addPass(new ClearMaskPass());

		pass = new ShaderPass(new CopyMaterial());
		pass.renderToScreen = true;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		const object = this.object;
		const maskObject = this.maskObject;

		let time;

		if(object !== null && maskObject !== null) {

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

			time = performance.now() * 0.001;

			maskObject.position.x = Math.cos(time / 1.5) * 4;
			maskObject.position.y = Math.sin(time) * 4;
			maskObject.rotation.x = time;
			maskObject.rotation.y = time * 0.5;

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const maskPass = this.maskPass;

		const params = {
			"use mask": maskPass.enabled
		};

		gui.add(this.pixelationPass, "granularity").min(0.0).max(50.0).step(0.1);
		gui.add(params, "use mask").onChange(function() { maskPass.enabled = params["use mask"]; });

	}

}
