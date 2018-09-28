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
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	EffectPass,
	SMAAEffect,
	TextureEffect
} from "../../../src";

/**
 * An SMAA demo setup.
 */

export class SMAADemo extends PostProcessingDemo {

	/**
	 * Constructs a new SMAA demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("smaa", composer);

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

		this.rendererAA = null;

		/**
		 * Secondary camera controls.
		 *
		 * @type {Disposable}
		 * @private
		 */

		this.controls2 = null;

		/**
		 * An SMAA effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.smaaEffect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

		/**
		 * A texture effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.textureEffect = null;

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

		return new Promise((resolve, reject) => {

			let image;

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
				image.src = SMAAEffect.searchImageDataURL;

				image = new Image();
				image.addEventListener("load", function() {

					assets.set("smaa-area", this);
					loadingManager.itemEnd("smaa-area");

				});

				loadingManager.itemStart("smaa-area");
				image.src = SMAAEffect.areaImageDataURL;

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

		// Create a second renderer with AA.

		const rendererAA = ((size, clearColor, pixelRatio) => {

			const renderer = new WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: true
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

		this.originalRenderer = composer.renderer;
		this.rendererAA = rendererAA;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		const controls2 = controls.clone();
		controls2.setDom(rendererAA.domElement);
		controls2.setEnabled(false);
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

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));

		const textureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: smaaEffect.renderTargetColorEdges.texture
		});

		const pass = new EffectPass(camera, smaaEffect, textureEffect);
		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;

		this.smaaEffect = smaaEffect;
		this.textureEffect = textureEffect;
		this.pass = pass;

		composer.addPass(pass);

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

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

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;
		const composer = this.composer;
		const renderPass = this.renderPass;
		const smaaEffect = this.smaaEffect;
		const textureEffect = this.textureEffect;
		const blendMode = smaaEffect.blendMode;

		const renderer1 = this.originalRenderer;
		const renderer2 = this.rendererAA;

		const controls1 = this.controls;
		const controls2 = this.controls2;

		const AAMode = {
			DISABLED: 0,
			BROWSER: 1,
			SMAA_EDGES: 2,
			SMAA: 3
		};

		const params = {
			"AA mode": AAMode.SMAA,
			"sensitivity": Number.parseFloat(smaaEffect.colorEdgesPass.getFullscreenMaterial().defines.EDGE_THRESHOLD),
			"search steps": Number.parseFloat(smaaEffect.weightsPass.getFullscreenMaterial().defines.MAX_SEARCH_STEPS_INT),
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		function swapRenderers(browser) {

			const size = composer.renderer.getSize();

			if(browser && composer.renderer !== renderer2) {

				renderer2.setSize(size.width, size.height);
				composer.replaceRenderer(renderer2);
				controls1.setEnabled(false);
				controls2.setEnabled(true).lookAt(controls1.getTarget());

			} else {

				renderer1.setSize(size.width, size.height);
				composer.replaceRenderer(renderer1);
				controls1.setEnabled(true).lookAt(controls2.getTarget());
				controls2.setEnabled(false);

			}

		}

		function toggleAAMode() {

			const mode = Number.parseInt(params["AA mode"]);

			pass.enabled = (mode === AAMode.SMAA || mode === AAMode.SMAA_EDGES);
			renderPass.renderToScreen = (mode === AAMode.DISABLED || mode === AAMode.BROWSER);
			textureEffect.blendMode.blendFunction = (mode === AAMode.SMAA_EDGES) ? BlendFunction.NORMAL : BlendFunction.SKIP;
			swapRenderers(mode === AAMode.BROWSER);
			pass.recompile();

		}

		menu.add(params, "AA mode", AAMode).onChange(toggleAAMode);

		menu.add(params, "sensitivity").min(0.05).max(0.5).step(0.01).onChange(() => {

			smaaEffect.setEdgeDetectionThreshold(params.sensitivity);

		});

		menu.add(params, "search steps").min(4).max(112).step(1).onChange(() => {

			smaaEffect.setOrthogonalSearchSteps(params["search steps"]);

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		if(this.rendererAA !== null) {

			this.rendererAA.dispose();
			this.rendererAA = null;

		}

		if(this.controls2 !== null) {

			this.controls2.dispose();
			this.controls2 = null;

		}

	}

}
