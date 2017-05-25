import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	OrbitControls,
	Object3D,
	RepeatWrapping,
	TextureLoader,
	WebGLRenderer
} from "three";

import { RenderPass, SMAAPass } from "../src";
import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * An SMAA demo setup.
 */

export class SMAADemo extends Demo {

	/**
	 * Constructs a new SMAA demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * The main renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer = null;

		/**
		 * A secondary renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer2 = null;

		/**
		 * Secondary camera controls.
		 *
		 * @type {OrbitControls}
		 * @private
		 */

		this.controls2 = null;

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = null;

		/**
		 * An SMAA pass.
		 *
		 * @type {SMAAPass}
		 * @private
		 */

		this.smaaPass = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.objectA = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.objectB = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.objectC = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
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

			textureLoader.load("textures/crate.jpg", function(texture) {

				texture.wrapS = texture.wrapT = RepeatWrapping;
				assets.set("crate-color", texture);

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

		// Renderer without AA.

		this.renderer2 = (function() {

			const renderer = new WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: false
			});

			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000);
			renderer.setPixelRatio(window.devicePixelRatio);

			return renderer;

		}());

		this.renderer = composer.replaceRenderer(this.renderer2);

		// Controls.

		this.controls = new OrbitControls(camera, this.renderer.domElement);
		this.controls2 = new OrbitControls(camera, this.renderer2.domElement);

		// Camera.

		camera.position.set(-3, 0, -3);
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

		// Objects.

		let mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshBasicMaterial({
				color: 0x000000,
				wireframe: true
			})
		);

		mesh.position.set(1.25, 0, -1.25);

		this.objectA = mesh;
		scene.add(mesh);

		mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				map: assets.get("crate-color")
			})
		);

		mesh.position.set(-1.25, 0, 1.25);

		this.objectB = mesh;
		scene.add(mesh);

		mesh = new Mesh(
			new BoxBufferGeometry(0.25, 8.25, 0.25),
			new MeshPhongMaterial({
				color: 0x0d0d0d
			})
		);

		const object = new Object3D();

		let o0, o1, o2;

		o0 = object.clone();

		let clone = mesh.clone();
		clone.position.set(-4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(-4, 0, -4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, -4);
		o0.add(clone);

		o1 = o0.clone();
		o1.rotation.set(Math.PI / 2, 0, 0);
		o2 = o0.clone();
		o2.rotation.set(0, 0, Math.PI / 2);

		object.add(o0);
		object.add(o1);
		object.add(o2);

		object.scale.set(0.1, 0.1, 0.1);

		this.objectC = object;
		scene.add(object);

		// Passes.

		let pass = new RenderPass(scene, camera);
		this.renderPass = pass;
		composer.addPass(pass);

		pass = new SMAAPass(Image);
		pass.renderToScreen = true;
		this.smaaPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		const objectA = this.objectA;
		const objectB = this.objectB;
		const objectC = this.objectC;

		if(objectA !== null) {

			objectA.rotation.x += 0.0005;
			objectA.rotation.y += 0.001;

			objectB.rotation.copy(objectA.rotation);
			objectC.rotation.copy(objectA.rotation);

			// Prevent overflow.
			if(objectA.rotation.x >= TWO_PI) { objectA.rotation.x -= TWO_PI; }
			if(objectA.rotation.y >= TWO_PI) { objectA.rotation.y -= TWO_PI; }

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
		const smaaPass = this.smaaPass;

		const renderer1 = this.renderer;
		const renderer2 = this.renderer2;

		const controls1 = this.controls;
		const controls2 = this.controls2;

		const params = {
			"browser AA": false,
			"SMAA": smaaPass.enabled,
			"SMAA threshold": Number.parseFloat(smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD)
		};

		function toggleSMAA() {

			renderPass.renderToScreen = !params.SMAA;
			smaaPass.enabled = params.SMAA;

		}

		function swapRenderers() {

			const size = composer.renderer.getSize();

			if(params["browser AA"]) {

				renderer1.setSize(size.width, size.height);
				composer.replaceRenderer(renderer1);
				controls1.enabled = true;
				controls2.enabled = false;

			} else {

				renderer2.setSize(size.width, size.height);
				composer.replaceRenderer(renderer2);
				controls1.enabled = false;
				controls2.enabled = true;

			}

		}

		gui.add(params, "browser AA").onChange(swapRenderers);
		gui.add(params, "SMAA").onChange(toggleSMAA);

		gui.add(params, "SMAA threshold").min(0.0).max(1.0).step(0.01).onChange(function() {
			smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD = params["SMAA threshold"].toFixed(2);
			smaaPass.colorEdgesMaterial.needsUpdate = true;
		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		this.renderer.dispose();
		this.renderer = null;

		this.controls2.dispose();
		this.controls2 = null;

	}

}
