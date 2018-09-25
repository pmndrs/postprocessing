import {
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	MeshPhongMaterial,
	ObjectLoader,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	RepeatWrapping,
	TextureLoader,
	Vector3
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	EffectPass,
	GodRaysEffect,
	KernelSize,
	SMAAEffect
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
		 * A directional light.
		 *
		 * @type {DirectionalLight}
		 * @private
		 */

		this.directionalLight = null;

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
		const textureLoader = new TextureLoader(loadingManager);
		const modelLoader = new ObjectLoader(loadingManager);

		const path = "textures/skies/starry/";
		const format = ".png";
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

				modelLoader.load("models/waggon.json", function(object) {

					object.rotation.x = Math.PI * 0.25;
					object.rotation.y = Math.PI * 0.75;

					assets.set("waggon", object);

				});

				textureLoader.load("textures/wood.jpg", function(texture) {

					texture.wrapS = texture.wrapT = RepeatWrapping;
					assets.set("wood-diffuse", texture);

				});

				textureLoader.load("textures/sun.png", function(texture) {

					assets.set("sun-diffuse", texture);

				});

				// Preload the SMAA images.
				let image = new Image();
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
		camera.position.set(-5, -1, -4);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 0.5, 0);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.rotation = 0.00125;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(target);
		this.controls = controls;

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x0f0f0f);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		this.directionalLight = directionalLight;

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const object = assets.get("waggon");
		const material = new MeshPhongMaterial({
			color: 0xffffff,
			map: assets.get("wood-diffuse")
		});

		object.traverse((child) => {

			child.material = material;

		});

		scene.add(object);

		// Sun.

		const sunMaterial = new PointsMaterial({
			map: assets.get("sun-diffuse"),
			size: 100,
			sizeAttenuation: true,
			color: 0xffddaa,
			alphaTest: 0,
			transparent: true,
			fog: false
		});

		const sunGeometry = new BufferGeometry();
		sunGeometry.addAttribute("position", new BufferAttribute(new Float32Array(3), 3));
		const sun = new Points(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		sun.position.set(75, 25, 100);

		this.sun = sun;
		scene.add(sun);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.setEdgeDetectionThreshold(0.065);

		const godRaysEffect = new GodRaysEffect(scene, camera, sun, {
			resolutionScale: 0.6,
			kernelSize: KernelSize.SMALL,
			density: 0.96,
			decay: 0.93,
			weight: 0.4,
			exposure: 0.6,
			samples: 60,
			clampMax: 1.0
		});

		godRaysEffect.dithering = true;
		this.effect = godRaysEffect;

		const pass = new EffectPass(camera, smaaEffect, godRaysEffect);
		this.pass = pass;

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const sun = this.sun;
		const directionalLight = this.directionalLight;

		const pass = this.pass;
		const effect = this.effect;
		const uniforms = effect.godRaysMaterial.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.getResolutionScale(),
			"blurriness": effect.kernelSize + 1,
			"density": uniforms.density.value,
			"decay": uniforms.decay.value,
			"weight": uniforms.weight.value,
			"exposure": uniforms.exposure.value,
			"clampMax": uniforms.clampMax.value,
			"samples": effect.samples,
			"color": sun.material.color.getHex(),
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution").min(0.01).max(1.0).step(0.01).onChange(() => {

			effect.setResolutionScale(params.resolution);

		});

		menu.add(effect, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange(() => {

			effect.blur = (params.blurriness > 0);
			effect.kernelSize = params.blurriness - 1;

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

			sun.material.color.setHex(params.color);
			directionalLight.color.setHex(params.color);

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
