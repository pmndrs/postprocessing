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

import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import * as Sponza from "./objects/Sponza.js";

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
				loadingManager.onError = reject;

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

		// Camera.

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 2000);
		camera.position.set(6, 1.2, -4);
		this.camera = camera;

		// Controls.

		const target = new Vector3(-2.5, 2.0, -3.25);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0x000000);

		// Lights.

		const ambientLight = new AmbientLight(0x101010);

		const mainLight = new PointLight(0xffe3b1);
		mainLight.position.set(-0.5, 3, -0.25);
		mainLight.castShadow = true;
		mainLight.shadow.mapSize.width = 1024;
		mainLight.shadow.mapSize.height = 1024;
		this.light = mainLight;

		scene.add(ambientLight, mainLight);

		// Sun.

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

		// Objects.

		scene.add(assets.get("sponza"));

		// Passes.

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);

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

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			effect.resolution.height = Number.parseInt(params.resolution);

		});

		menu.add(pass, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange(() => {

			effect.blur = (params.blurriness > 0);
			effect.blurPass.kernelSize = params.blurriness - 1;

		});

		menu.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.density.value = params.density;

		});

		menu.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.decay.value = params.decay;

		});

		menu.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.weight.value = params.weight;

		});

		menu.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.exposure.value = params.exposure;

		});

		menu.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.clampMax.value = params.clampMax;

		});

		menu.add(effect, "samples").min(15).max(200).step(1);

		menu.addColor(params, "color").onChange(() => {

			sun.material.color.setHex(params.color).convertSRGBToLinear();
			light.color.setHex(params.color).convertSRGBToLinear();

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

	}

}
