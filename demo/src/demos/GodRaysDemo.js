import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	Group,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	SphereBufferGeometry,
	TextureLoader,
	Vector3
} from "three";

import { DeltaControls } from "delta-controls";
import GLTFLoader from "three-gltf-loader";
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
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);
		const textureLoader = new TextureLoader(loadingManager);
		const modelLoader = new GLTFLoader(loadingManager);

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

				modelLoader.load("models/tree/scene.gltf", function(gltf) {

					gltf.scene.scale.multiplyScalar(2.5);
					gltf.scene.position.set(0, -2.3, 0);
					gltf.scene.rotation.set(0, 3, 0);

					assets.set("model", gltf.scene);

				});

				textureLoader.load("textures/sun.png", function(texture) {

					assets.set("sun-diffuse", texture);

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

		const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(-6, -1, -6);
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

		const ambientLight = new AmbientLight(0x808080);
		const directionalLight = new DirectionalLight(0xffbbaa);
		directionalLight.position.set(75, 25, 100);
		directionalLight.target = scene;

		this.light = directionalLight;

		scene.add(ambientLight);
		scene.add(directionalLight);

		// Objects.

		scene.add(assets.get("model"));

		// Sun.

		const sunMaterial = new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new SphereBufferGeometry(16, 32, 32);
		const sun = new Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;

		const group = new Group();
		group.position.copy(this.light.position);
		group.add(sun);

		// The sun mesh is not added to the scene to hide hard geometry edges.
		// scene.add(group);
		sun.matrixAutoUpdate = false;
		this.sun = sun;

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.065);

		const godRaysEffect = new GodRaysEffect(camera, sun, {
			height: 720,
			kernelSize: KernelSize.SMALL,
			density: 0.96,
			decay: 0.92,
			weight: 0.3,
			exposure: 0.54,
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
			"color": sun.material.color.getHex(),
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			effect.height = Number.parseInt(params.resolution);

		});

		menu.add(effect, "dithering");

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

			sun.material.color.setHex(params.color);
			light.color.setHex(params.color);

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
