import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	SphereBufferGeometry,
	TextureLoader
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	ChromaticAberrationEffect,
	EffectPass,
	GlitchMode,
	GlitchEffect,
	NoiseEffect,
	SMAAEffect
} from "../../../src";

/**
 * A glitch demo setup.
 */

export class GlitchDemo extends PostProcessingDemo {

	/**
	 * Constructs a new glitch demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("glitch", composer);

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
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space4/";
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

				textureLoader.load("textures/perturb.jpg", function(texture) {

					assets.set("perturbation-map", texture);

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

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(6, 1, 6);
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

		const object = new Object3D();
		const geometry = new SphereBufferGeometry(1, 4, 4);

		let material, mesh;
		let i;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				flatShading: true
			});

			mesh = new Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 10);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.multiplyScalar(Math.random());
			object.add(mesh);

		}

		this.object = object;
		scene.add(object);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.setEdgeDetectionThreshold(0.08);

		const chromaticAberrationEffect = new ChromaticAberrationEffect();

		const glitchEffect = new GlitchEffect({
			perturbationMap: assets.get("perturbation-map"),
			chromaticAberrationOffset: chromaticAberrationEffect.offset
		});

		const noiseEffect = new NoiseEffect({
			blendFunction: BlendFunction.COLOR_DODGE
		});

		noiseEffect.blendMode.opacity.value = 0.15;

		const smaaPass = new EffectPass(camera, smaaEffect);
		const glitchPass = new EffectPass(camera, glitchEffect, noiseEffect);
		const chromaticAberrationPass = new EffectPass(camera, chromaticAberrationEffect);

		this.renderPass.renderToScreen = false;
		chromaticAberrationPass.renderToScreen = true;

		this.effect = glitchEffect;

		composer.addPass(smaaPass);
		composer.addPass(glitchPass);
		composer.addPass(chromaticAberrationPass);

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

		const effect = this.effect;
		const perturbationMap = effect.getPerturbationMap();
		const uniforms = effect.uniforms;
		const delay = effect.delay;
		const duration = effect.duration;
		const strength = effect.strength;

		const params = {
			"glitch mode": effect.mode,
			"custom pattern": true,
			"min delay": delay.x,
			"max delay": delay.y,
			"min duration": duration.x,
			"max duration": duration.y,
			"weak glitches": strength.x,
			"strong glitches": strength.y,
			"glitch ratio": effect.ratio,
			"columns": uniforms.get("columns").value
		};

		menu.add(params, "glitch mode", GlitchMode).onChange(() => {

			effect.mode = Number.parseInt(params["glitch mode"]);

		});

		menu.add(params, "custom pattern").onChange(() => {

			if(params["custom pattern"]) {

				effect.setPerturbationMap(perturbationMap);

			} else {

				effect.setPerturbationMap(effect.generatePerturbationMap(64));

			}

		});

		menu.add(params, "min delay").min(0.0).max(2.0).step(0.001).onChange(() => {

			delay.x = params["min delay"];

		});

		menu.add(params, "max delay").min(2.0).max(4.0).step(0.001).onChange(() => {

			delay.y = params["max delay"];

		});

		menu.add(params, "min duration").min(0.0).max(0.6).step(0.001).onChange(() => {

			duration.x = params["min duration"];

		});

		menu.add(params, "max duration").min(0.6).max(1.8).step(0.001).onChange(() => {

			duration.y = params["max duration"];

		});

		menu.add(params, "weak glitches").min(0.0).max(1.0).step(0.001).onChange(() => {

			strength.x = params["weak glitches"];

		});

		menu.add(params, "strong glitches").min(0.0).max(1.0).step(0.001).onChange(() => {

			strength.y = params["strong glitches"];

		});

		menu.add(params, "glitch ratio").min(0.0).max(1.0).step(0.001).onChange(() => {

			effect.ratio = Number.parseFloat(params["glitch ratio"]);

		});

		menu.add(params, "columns").min(0.0).max(0.5).step(0.001).onChange(() => {

			uniforms.get("columns").value = params.columns;

		});

	}

}
