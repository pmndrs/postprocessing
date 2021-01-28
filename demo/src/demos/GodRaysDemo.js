import {
	AmbientLight,
	Color,
	Group,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PointLight,
	SphereBufferGeometry,
	Vector3
} from "three";

import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	EdgeDetectionMode,
	EffectPass,
	GodRaysEffect,
	KernelSize,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A god rays demo setup.
 */

export class GodRaysDemo extends PostProcessingDemo {

	/**
	 * Constructs a new god rays demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("god-rays", composer);

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A sun.
		 *
		 * @type {Points}
		 * @private
		 */

		this.sun = null;

		/**
		 * A light.
		 *
		 * @type {Light}
		 * @private
		 */

		this.light = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer().capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

				Sponza.load(assets, loadingManager, anisotropy);

				smaaImageLoader.load(([search, area]) => {

					assets.set("smaa-search", search);
					assets.set("smaa-area", area);

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
		const renderer = composer.getRenderer();

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.3, 2000);
		camera.position.set(9.25, 2.4, 1);
		this.camera = camera;

		// Controls

		const target = new Vector3(8.4, 2.15, 0.5);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky

		scene.background = new Color(0x000000);

		// Lights

		const ambientLight = new AmbientLight(0x101010);

		const mainLight = new PointLight(0xffe3b1);
		mainLight.position.set(-0.5, 3, -0.25);
		mainLight.castShadow = true;
		mainLight.shadow.mapSize.width = 1024;
		mainLight.shadow.mapSize.height = 1024;
		this.light = mainLight;

		scene.add(ambientLight, mainLight);

		// Sun

		const sunMaterial = new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new SphereBufferGeometry(0.75, 32, 32);
		const sun = new Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		sun.matrixAutoUpdate = false;
		// sun.position.copy(this.light.position);
		// sun.updateMatrix();

		// Using a group to check if matrix updates work correctly.
		const group = new Group();
		group.position.copy(this.light.position);
		group.add(sun);

		// The sun is not added to the scene to hide hard geometry edges.
		// scene.add(group);
		this.sun = sun;

		// Objects

		scene.add(assets.get(Sponza.tag));

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const godRaysEffect = new GodRaysEffect(camera, sun, {
			height: 480,
			kernelSize: KernelSize.SMALL,
			density: 0.96,
			decay: 0.92,
			weight: 0.3,
			exposure: 0.54,
			samples: 60,
			clampMax: 1.0
		});

		const pass = new EffectPass(camera, smaaEffect, godRaysEffect);
		this.effect = godRaysEffect;
		this.pass = pass;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const color = new Color();

		const sun = this.sun;
		const light = this.light;

		const pass = this.pass;
		const effect = this.effect;
		const uniforms = effect.godRaysMaterial.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.height,
			"blurriness": effect.blurPass.kernelSize + 1,
			"density": uniforms.density.value,
			"decay": uniforms.decay.value,
			"weight": uniforms.weight.value,
			"exposure": uniforms.exposure.value,
			"clampMax": uniforms.clampMax.value,
			"samples": effect.samples,
			"color": color.copyLinearToSRGB(sun.material.color).getHex(),
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {

			effect.resolution.height = Number(value);

		});

		menu.add(pass, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange((value) => {

			effect.blur = (value > 0);
			effect.blurPass.kernelSize = value - 1;

		});

		menu.add(params, "density").min(0.0).max(1.0).step(0.01).onChange((value) => {

			uniforms.density.value = value;

		});

		menu.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange((value) => {

			uniforms.decay.value = value;

		});

		menu.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange((value) => {

			uniforms.weight.value = value;

		});

		menu.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange((value) => {

			uniforms.exposure.value = value;

		});

		menu.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange((value) => {

			uniforms.clampMax.value = value;

		});

		menu.add(effect, "samples").min(15).max(200).step(1);

		menu.addColor(params, "color").onChange((value) => {

			sun.material.color.setHex(value).convertSRGBToLinear();
			light.color.setHex(value).convertSRGBToLinear();

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

	}

}
