import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	PerspectiveCamera,
	Raycaster,
	sRGBEncoding,
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
	BloomEffect,
	EdgeDetectionMode,
	EffectPass,
	KernelSize,
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
		 * @type {BloomEffect}
		 * @private
		 */

		this.effectA = null;

		/**
		 * A selective bloom effect.
		 *
		 * @type {SelectiveBloomEffect}
		 * @private
		 */

		this.effectB = null;

		/**
		 * A pass that contains the normal bloom effect.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.passA = null;

		/**
		 * A pass that contains the selective bloom effect.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.passB = null;

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

		this.selectedObject = null;

		if(intersects.length > 0) {

			const object = intersects[0].object;

			if(object !== undefined) {

				this.selectedObject = object;

			}

		}

	}

	/**
	 * Handles the current selection.
	 *
	 * @private
	 */

	handleSelection() {

		const selection = this.effectB.selection;
		const selectedObject = this.selectedObject;

		if(selectedObject !== null) {

			if(selection.has(selectedObject)) {

				selection.delete(selectedObject);

			} else {

				selection.add(selectedObject);

			}

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

					t.encoding = sRGBEncoding;
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

		const ambientLight = new AmbientLight(0x323232);
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

		const bloomOptions = {
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KernelSize.MEDIUM,
			luminanceThreshold: 0.4,
			luminanceSmoothing: 0.1,
			height: 480
		};

		/* If you don't need to limit bloom to a subset of objects, consider using
		the basic BloomEffect for better performance. */
		const bloomEffect = new BloomEffect(bloomOptions);

		const selectiveBloomEffect = new SelectiveBloomEffect(
			scene,
			camera,
			bloomOptions
		);

		selectiveBloomEffect.inverted = true;

		this.effectA = bloomEffect;
		this.effectB = selectiveBloomEffect;

		const effectPassA = new EffectPass(
			camera,
			smaaEffect,
			bloomEffect
		);

		const effectPassB = new EffectPass(
			camera,
			smaaEffect,
			selectiveBloomEffect
		);

		this.passA = effectPassA;
		this.passB = effectPassB;

		effectPassA.renderToScreen = true;
		effectPassB.renderToScreen = true;
		effectPassB.setEnabled(false);

		composer.addPass(effectPassA);
		composer.addPass(effectPassB);

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

		const renderer = this.composer.getRenderer();

		const passA = this.passA;
		const passB = this.passB;
		const effectA = this.effectA;
		const effectB = this.effectB;
		const blendModeA = effectA.blendMode;
		const blendModeB = effectB.blendMode;

		const params = {
			"resolution": effectA.resolution.height,
			"kernel size": effectA.blurPass.getKernelSize(),
			"blur scale": effectA.blurPass.getScale(),
			"intensity": effectA.getIntensity(),
			"luminance": {
				"filter": effectA.luminancePass.isEnabled(),
				"threshold": effectA.luminanceMaterial.threshold,
				"smoothing": effectA.luminanceMaterial.smoothing
			},
			"selection": {
				"enabled": passB.isEnabled(),
				"inverted": effectB.inverted,
				"ignore bg": effectB.ignoreBackground
			},
			"opacity": blendModeA.opacity.value,
			"blend mode": blendModeA.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {

			effectA.resolution.height = effectB.resolution.height = Number(value);

		});

		menu.add(params, "kernel size", KernelSize).onChange((value) => {

			effectA.blurPass.setKernelSize(Number(value));
			effectB.blurPass.setKernelSize(Number(value));

		});

		menu.add(params, "blur scale", 0.0, 1.0, 0.01).onChange((value) => {

			effectA.blurPass.setScale(Number(value));
			effectB.blurPass.setScale(Number(value));

		});

		menu.add(params, "intensity", 0.0, 3.0, 0.01).onChange((value) => {

			effectA.blurPass.setIntensity(Number(value));
			effectB.blurPass.setIntensity(Number(value));

		});

		let folder = menu.addFolder("Luminance");

		folder.add(params.luminance, "filter").onChange((value) => {

			effectA.luminancePass.setEnabled(value);
			effectB.luminancePass.setEnabled(value);

		});

		folder.add(params.luminance, "threshold", 0.0, 1.0, 0.001)
			.onChange((value) => {

				effectA.luminanceMaterial.threshold = Number(value);
				effectB.luminanceMaterial.threshold = Number(value);

			});

		folder.add(params.luminance, "smoothing", 0.0, 1.0, 0.001)
			.onChange((value) => {

				effectA.luminanceMaterial.smoothing = Number(value);
				effectB.luminanceMaterial.smoothing = Number(value);

			});

		folder.open();
		folder = menu.addFolder("Selection");

		folder.add(params.selection, "enabled").onChange((value) => {

			passB.setEnabled(value);
			passA.setEnabled(!passB.isEnabled());

			if(passB.isEnabled()) {

				renderer.domElement.addEventListener("pointerdown", this);

			} else {

				renderer.domElement.removeEventListener("pointerdown", this);

			}

		});

		folder.add(params.selection, "inverted").onChange((value) => {

			effectB.inverted = value;

		});

		folder.add(params.selection, "ignore bg").onChange((value) => {

			effectB.ignoreBackground = value;

		});

		folder.open();

		menu.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			blendModeA.opacity.value = blendModeB.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendModeA.setBlendFunction(Number(value));
			blendModeB.setBlendFunction(Number(value));

		});

		menu.add(passA, "dithering").onChange((value) => {

			passB.dithering = value;

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
