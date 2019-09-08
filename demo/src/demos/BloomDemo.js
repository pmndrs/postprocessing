import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	MeshLambertMaterial,
	Object3D,
	PerspectiveCamera,
	Raycaster,
	SphereBufferGeometry,
	Vector2
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	EffectPass,
	KernelSize,
	SelectiveBloomEffect,
	SMAAEffect
} from "../../../src";

/**
 * A mouse position.
 *
 * @type {Vector2}
 * @private
 */

const mouse = new Vector2();

/**
 * A bloom demo setup.
 *
 * @implements {EventListener}
 */

export class BloomDemo extends PostProcessingDemo {

	/**
	 * Constructs a new bloom demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("bloom", composer);

		/**
		 * A raycaster.
		 *
		 * @type {Raycaster}
		 * @private
		 */

		this.raycaster = null;

		/**
		 * A selected object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.selectedObject = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

	}

	/**
	 * Raycasts the scene.
	 *
	 * @param {PointerEvent} event - A pointer event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;

		mouse.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
		mouse.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;

		raycaster.setFromCamera(mouse, this.camera);
		const intersects = raycaster.intersectObjects(this.object.children);

		this.selectedObject = null;

		if(intersects.length > 0) {

			const x = intersects[0];

			if(x.object !== undefined) {

				this.selectedObject = x.object;

			} else {

				console.warn("Encountered an undefined object", intersects);

			}

		}

	}

	/**
	 * Handles the current selection.
	 *
	 * @private
	 */

	handleSelection() {

		const selection = this.effect.selection;
		const selectedObject = this.selectedObject;

		if(selectedObject !== null) {

			if(selection.has(selectedObject)) {

				selection.delete(selectedObject);

			} else {

				selection.add(selectedObject);

			}

		}

	}

	/**
	 * Raycasts on mouse move events.
	 *
	 * @param {Event} event - An event.
	 */

	handleEvent(event) {

		switch(event.type) {

			case "mousemove":
				this.raycast(event);
				break;

			case "mousedown":
				this.handleSelection();
				break;

		}

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

		const path = "textures/skies/space2/";
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

				this.loadSMAAImages();

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

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 2000);
		camera.position.set(-10, 6, 15);
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

		directionalLight.position.set(-1, 1, 1);
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
			mesh.position.multiplyScalar(Math.random() * 4);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.multiplyScalar(Math.random() * 0.5);
			object.add(mesh);

		}

		this.object = object;

		scene.add(object);

		// Cage object.

		mesh = new Mesh(
			new BoxBufferGeometry(0.25, 8.25, 0.25),
			new MeshLambertMaterial({
				color: 0x0b0b0b
			})
		);

		object = new Object3D();
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

		scene.add(object);

		// Raycaster.

		this.raycaster = new Raycaster();
		renderer.domElement.addEventListener("mousemove", this);
		renderer.domElement.addEventListener("mousedown", this);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);

		/* If you don't need to limit bloom to a subset of objects, consider using
		the BloomEffect instead for better performance.*/
		const bloomEffect = new SelectiveBloomEffect(scene, camera, {
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KernelSize.MEDIUM,
			luminanceThreshold: 0.825,
			luminanceSmoothing: 0.075,
			height: 480
		});

		bloomEffect.inverted = true;
		bloomEffect.blendMode.opacity.value = 2.3;
		this.effect = bloomEffect;

		const pass = new EffectPass(camera, smaaEffect, bloomEffect);
		this.pass = pass;

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;

		composer.addPass(pass);

		// Important: Make sure your lights are visible!
		ambientLight.layers.enable(bloomEffect.selection.layer);
		directionalLight.layers.enable(bloomEffect.selection.layer);

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

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

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;
		const effect = this.effect;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.height,
			"kernel size": effect.blurPass.kernelSize,
			"scale": effect.blurPass.scale,
			"luminance": {
				"filter": effect.luminancePass.enabled,
				"threshold": effect.luminanceMaterial.threshold,
				"smoothing": effect.luminanceMaterial.smoothing
			},
			"selection": {
				"inverted": effect.inverted,
				"ignore bg": effect.ignoreBackground
			},
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			effect.height = Number.parseInt(params.resolution);

		});

		menu.add(params, "kernel size", KernelSize).onChange(() => {

			effect.blurPass.kernelSize = Number.parseInt(params["kernel size"]);

		});

		menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(() => {

			effect.blurPass.scale = Number.parseFloat(params.scale);

		});

		let folder = menu.addFolder("Luminance");

		folder.add(params.luminance, "filter").onChange(() => {

			effect.luminancePass.enabled = params.luminance.filter;

		});

		folder.add(params.luminance, "threshold").min(0.0).max(1.0).step(0.001).onChange(() => {

			effect.luminanceMaterial.threshold = Number.parseFloat(params.luminance.threshold);

		});

		folder.add(params.luminance, "smoothing").min(0.0).max(1.0).step(0.001).onChange(() => {

			effect.luminanceMaterial.smoothing = Number.parseFloat(params.luminance.smoothing);

		});

		folder.open();

		folder = menu.addFolder("Selection");

		folder.add(params.selection, "inverted").onChange(() => {

			effect.inverted = params.selection.inverted;

		});

		folder.add(params.selection, "ignore bg").onChange(() => {

			effect.ignoreBackground = params.selection["ignore bg"];

		});

		folder.open();

		menu.add(params, "opacity").min(0.0).max(4.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

		menu.add(effect, "dithering");

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		const dom = this.composer.renderer.domElement;
		dom.removeEventListener("mousemove", this);
		dom.removeEventListener("mousedown", this);

		return this;

	}

}
