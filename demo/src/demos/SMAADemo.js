import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	RepeatWrapping,
	TextureLoader,
	WebGLRenderer
} from "three";

import { DeltaControls } from "delta-controls";
import { Demo } from "three-demo";
import { SMAAPass, TexturePass } from "../../../src";

/**
 * An SMAA demo setup.
 */

export class SMAADemo extends Demo {

	/**
	 * Constructs a new SMAA demo.
	 */

	constructor() {

		super("smaa");

		/**
		 * The main renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.originalRenderer = null;

		/**
		 * A secondary renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.rendererNoAA = null;

		/**
		 * Secondary camera controls.
		 *
		 * @type {Disposable}
		 * @private
		 */

		this.controls2 = null;

		/**
		 * An SMAA pass.
		 *
		 * @type {SMAAPass}
		 * @private
		 */

		this.smaaPass = null;

		/**
		 * A texture pass.
		 *
		 * @type {TexturePass}
		 * @private
		 */

		this.texturePass = null;

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

		let image;

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

				// Preload the SMAA images.
				image = new Image();
				image.addEventListener("load", function() {

					assets.set("smaa-search", this);
					loadingManager.itemEnd("smaa-search");

				});

				loadingManager.itemStart("smaa-search");
				image.src = SMAAPass.searchImageDataURL;

				image = new Image();
				image.addEventListener("load", function() {

					assets.set("smaa-area", this);
					loadingManager.itemEnd("smaa-area");

				});

				loadingManager.itemStart("smaa-area");
				image.src = SMAAPass.areaImageDataURL;

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

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

		// Create a second renderer without AA.

		const rendererNoAA = ((size, clearColor, pixelRatio) => {

			const renderer = new WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: false
			});

			renderer.setSize(size.width, size.height);
			renderer.setClearColor(clearColor);
			renderer.setPixelRatio(pixelRatio);

			return renderer;

		})(
			renderer.getSize(),
			renderer.getClearColor(),
			renderer.getPixelRatio()
		);

		this.originalRenderer = composer.replaceRenderer(rendererNoAA);
		this.rendererNoAA = rendererNoAA;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		controls.setEnabled(false);
		this.controls = controls;

		const controls2 = controls.clone();
		controls2.setDom(rendererNoAA.domElement);
		controls2.setEnabled(true);
		this.controls2 = controls2;

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

		this.renderPass.renderToScreen = false;

		let pass = new SMAAPass(assets.get("smaa-search"), assets.get("smaa-area"));
		pass.renderToScreen = true;
		this.smaaPass = pass;
		composer.addPass(pass);

		pass = new TexturePass(this.smaaPass.renderTargetColorEdges.texture);
		pass.renderToScreen = true;
		pass.enabled = false;
		this.texturePass = pass;
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
		const twoPI = 2.0 * Math.PI;

		objectA.rotation.x += 0.0005;
		objectA.rotation.y += 0.001;

		objectB.rotation.copy(objectA.rotation);
		objectC.rotation.copy(objectA.rotation);

		if(objectA.rotation.x >= twoPI) {

			objectA.rotation.x -= twoPI;

		}

		if(objectA.rotation.y >= twoPI) {

			objectA.rotation.y -= twoPI;

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
		const smaaPass = this.smaaPass;
		const texturePass = this.texturePass;

		const renderer1 = this.originalRenderer;
		const renderer2 = this.rendererNoAA;

		const controls1 = this.controls;
		const controls2 = this.controls2;

		const SMAAMode = {
			disabled: "disabled",
			edges: "edges",
			blend: "blend"
		};

		const params = {
			"browser AA": false,
			"SMAA": SMAAMode.blend,
			"sensitivity": Number.parseFloat(smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD),
			"search steps": Number.parseFloat(smaaPass.weightsMaterial.defines.MAX_SEARCH_STEPS_INT)
		};

		function toggleSMAAMode() {

			renderPass.renderToScreen = (params.SMAA === SMAAMode.disabled);
			smaaPass.enabled = (params.SMAA !== SMAAMode.disabled);
			texturePass.enabled = (params.SMAA === SMAAMode.edges);

		}

		function swapRenderers() {

			const size = composer.renderer.getSize();

			if(params["browser AA"]) {

				renderer1.setSize(size.width, size.height);
				composer.replaceRenderer(renderer1);
				controls1.setEnabled(true).lookAt(controls2.getTarget());
				controls2.setEnabled(false);

			} else {

				renderer2.setSize(size.width, size.height);
				composer.replaceRenderer(renderer2);
				controls1.setEnabled(false);
				controls2.setEnabled(true).lookAt(controls1.getTarget());

			}

		}

		menu.add(params, "browser AA").onChange(swapRenderers);
		menu.add(params, "SMAA", SMAAMode).onChange(toggleSMAAMode);

		menu.add(params, "sensitivity").min(0.05).max(0.5).step(0.01).onChange(function() {

			smaaPass.colorEdgesMaterial.setEdgeDetectionThreshold(params.sensitivity);

		});

		menu.add(params, "search steps").min(8).max(112).step(1).onChange(function() {

			smaaPass.weightsMaterial.setOrthogonalSearchSteps(params["search steps"]);

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		if(this.rendererNoAA !== null) {

			this.rendererNoAA.dispose();
			this.rendererNoAA = null;

		}

		if(this.controls2 !== null) {

			this.controls2.dispose();
			this.controls2 = null;

		}

	}

}
