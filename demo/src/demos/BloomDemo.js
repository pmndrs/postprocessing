import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	PerspectiveCamera,
	Raycaster,
	SRGBColorSpace,
	Vector2
} from "three";

import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Cage from "./objects/Cage";
import * as ObjectCloud from "./objects/ObjectCloud";

import {
	BlendFunction,
	EdgeDetectionMode,
	EffectPass,
	SelectiveBloomEffect,
	SMAAEffect,
	SMAAPreset,
	SMAAImageLoader
} from "../../../src";

/**
 * Normalized device coordinates.
 *
 * @type {Vector2}
 * @private
 */

const ndc = new Vector2();

/**
 * A bloom demo.
 *
 * @implements {EventListenerObject}
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
		 * A bloom effect.
		 *
		 * @type {SelectiveBloomEffect}
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
	 * @param {PointerEvent} event - An event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;

		ndc.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
		ndc.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;

		raycaster.setFromCamera(ndc, this.camera);
		const intersects = raycaster.intersectObjects(this.object.children, true);
		this.selectedObject = (intersects.length > 0) ? intersects[0].object : null;

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

			selection.toggle(selectedObject);

		}

	}

	handleEvent(event) {

		switch(event.type) {

			case "pointerdown":
				this.raycast(event);
				this.handleSelection();
				break;

		}

	}

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const path = "textures/skies/space-green/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

				cubeTextureLoader.load(urls, (t) => {

					t.colorSpace = SRGBColorSpace;
					assets.set("sky", t);

				});

				smaaImageLoader.load(([search, area]) => {

					assets.set("smaa-search", search);
					assets.set("smaa-area", area);

				});

			} else {

				resolve();

			}

		});

	}

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.getRenderer();
		const domElement = renderer.domElement;

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
		const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
		this.camera = camera;

		// Controls

		const { position, quaternion } = camera;
		const controls = new SpatialControls(position, quaternion, domElement);
		const settings = controls.settings;
		settings.general.setMode(ControlMode.THIRD_PERSON);
		settings.rotation.setSensitivity(2.2);
		settings.rotation.setDamping(0.05);
		settings.translation.setEnabled(false);
		settings.zoom.setSensitivity(1.0);
		controls.setPosition(-10, 6, 15);
		this.controls = controls;

		// Sky

		scene.background = assets.get("sky");

		// Lights

		const ambientLight = new AmbientLight(0x7a7a7a);
		const mainLight = new DirectionalLight(0xffffff, 1.0);
		mainLight.position.set(-1, 1, 1);

		scene.add(ambientLight, mainLight);

		// Objects

		const cloud = ObjectCloud.create();
		cloud.scale.setScalar(0.4);
		this.object = cloud;
		scene.add(cloud);

		scene.add(Cage.create());

		// Raycaster

		this.raycaster = new Raycaster();

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const effect = new SelectiveBloomEffect(scene, camera, {
			blendFunction: BlendFunction.ADD,
			mipmapBlur: true,
			luminanceThreshold: 0.4,
			luminanceSmoothing: 0.3,
			intensity: 3.0
		});

		effect.inverted = true;
		const effectPass = new EffectPass(camera, smaaEffect, effect);
		composer.addPass(effectPass);

		this.effect = effect;
		this.pass = effectPass;

		renderer.domElement.addEventListener("pointerdown", this);

	}

	update(deltaTime, timestamp) {

		const object = this.object;
		const PI2 = 2.0 * Math.PI;

		object.rotation.x += 0.05 * deltaTime;
		object.rotation.y += 0.25 * deltaTime;

		if(object.rotation.x >= PI2) {

			object.rotation.x -= PI2;

		}

		if(object.rotation.y >= PI2) {

			object.rotation.y -= PI2;

		}

	}

	registerOptions(menu) {

		const pass = this.pass;
		const effect = this.effect;
		const blendMode = effect.blendMode;

		const params = {
			"intensity": effect.intensity,
			"radius": effect.mipmapBlurPass.radius,
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

		menu.add(params, "intensity", 0.0, 10.0, 0.01).onChange((value) => {

			effect.intensity = Number(value);

		});

		menu.add(params, "radius", 0.0, 1.0, 0.001).onChange((value) => {

			effect.mipmapBlurPass.radius = Number(value);

		});

		let folder = menu.addFolder("Luminance");

		folder.add(params.luminance, "filter").onChange((value) => {

			effect.luminancePass.enabled = value;

		});

		folder.add(params.luminance, "threshold", 0.0, 1.0, 0.001)
			.onChange((value) => {

				effect.luminanceMaterial.threshold = Number(value);

			});

		folder.add(params.luminance, "smoothing", 0.0, 1.0, 0.001)
			.onChange((value) => {

				effect.luminanceMaterial.smoothing = Number(value);

			});

		folder.open();
		folder = menu.addFolder("Selection");

		folder.add(params.selection, "inverted").onChange((value) => {

			effect.inverted = value;

		});

		folder.add(params.selection, "ignore bg").onChange((value) => {

			effect.ignoreBackground = value;

		});

		folder.open();

		menu.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

		menu.add(pass, "dithering").onChange((value) => {

			pass.dithering = value;

		});

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

	dispose() {

		const dom = this.composer.getRenderer().domElement;
		dom.removeEventListener("pointerdown", this);

	}

}
