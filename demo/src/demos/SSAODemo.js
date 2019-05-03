import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Group,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	PlaneBufferGeometry,
	PointLight,
	Vector2,
	WebGLRenderer
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	EffectPass,
	NormalPass,
	SSAOEffect,
	SMAAEffect
} from "../../../src";

/**
 * An SSAO demo setup.
 */

export class SSAODemo extends PostProcessingDemo {

	/**
	 * Constructs a new SSAO demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("ssao", composer);

		/**
		 * A renderer that uses a shadow map.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * An effect pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass = null;

		/**
		 * A pass that renders scene normals.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.normalPass = null;

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

		// Create a renderer with shadows enabled.

		const renderer = ((renderer) => {

			const size = renderer.getSize(new Vector2());
			const pixelRatio = renderer.getPixelRatio();

			renderer = new WebGLRenderer({
				logarithmicDepthBuffer: true,
				antialias: false
			});

			renderer.setSize(size.width, size.height);
			renderer.setPixelRatio(pixelRatio);
			renderer.shadowMap.enabled = true;

			return renderer;

		})(composer.renderer);

		composer.replaceRenderer(renderer);
		this.renderer = renderer;

		// Camera.

		const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1000);
		camera.position.set(0, 0, 30);
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

		const ambientLight = new AmbientLight(0x544121);

		const lightCeiling = new PointLight(0xffe3b1, 1.0, 25);
		lightCeiling.position.set(0, 9.3, 0);
		lightCeiling.castShadow = true;
		lightCeiling.shadow.mapSize.width = 1024;
		lightCeiling.shadow.mapSize.height = 1024;
		lightCeiling.shadow.bias = 1e-4;
		lightCeiling.shadow.radius = 4;

		const lightRed = new DirectionalLight(0xff0000, 0.1);
		lightRed.position.set(-10, 0, 0);
		lightRed.target.position.copy(scene.position);

		const lightGreen = new DirectionalLight(0x00ff00, 0.1);
		lightGreen.position.set(10, 0, 0);
		lightGreen.target.position.copy(scene.position);

		scene.add(lightCeiling);
		scene.add(lightRed);
		scene.add(lightGreen);
		scene.add(ambientLight);

		// Cornell box.

		const environment = new Group();
		const actors = new Group();
		const shininess = 5;

		const planeGeometry = new PlaneBufferGeometry();
		const planeMaterial = new MeshPhongMaterial({
			color: 0xffffff, shininess: shininess
		});

		const plane00 = new Mesh(planeGeometry, planeMaterial);
		const plane01 = new Mesh(planeGeometry, planeMaterial);
		const plane02 = new Mesh(planeGeometry, planeMaterial);
		const plane03 = new Mesh(planeGeometry, planeMaterial);
		const plane04 = new Mesh(planeGeometry, planeMaterial);

		plane00.position.y = -10;
		plane00.rotation.x = Math.PI * 0.5;
		plane00.scale.set(20, 20, 1);

		plane01.position.y = -10;
		plane01.rotation.x = Math.PI * -0.5;
		plane01.scale.set(20, 20, 1);
		plane01.receiveShadow = true;

		plane02.position.y = 10;
		plane02.rotation.x = Math.PI * 0.5;
		plane02.scale.set(20, 20, 1);
		plane02.receiveShadow = true;

		plane03.position.z = -10;
		plane03.scale.set(20, 20, 1);
		plane03.receiveShadow = true;

		plane04.position.z = 10;
		plane04.rotation.y = Math.PI;
		plane04.scale.set(20, 20, 1);
		plane04.receiveShadow = true;

		const plane05 = new Mesh(planeGeometry, new MeshPhongMaterial({
			color: 0xff0000, shininess: shininess
		}));

		const plane06 = new Mesh(planeGeometry, new MeshPhongMaterial({
			color: 0x00ff00, shininess: shininess
		}));

		const plane07 = new Mesh(planeGeometry, new MeshPhongMaterial({
			color: 0xffffff, emissive: 0xffffff, shininess: shininess
		}));

		plane05.position.x = -10;
		plane05.rotation.y = Math.PI * 0.5;
		plane05.scale.set(20, 20, 1);
		plane05.receiveShadow = true;

		plane06.position.x = 10;
		plane06.rotation.y = Math.PI * -0.5;
		plane06.scale.set(20, 20, 1);
		plane06.receiveShadow = true;

		plane07.position.y = 10 - 1e-2;
		plane07.rotation.x = Math.PI * 0.5;
		plane07.scale.set(4, 4, 1);

		const actorMaterial = new MeshPhongMaterial({
			color: 0xffffff, shininess: shininess
		});

		const box01 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);
		const box02 = new Mesh(new BoxBufferGeometry(1, 1, 1), actorMaterial);

		box01.position.set(-3.5, -4, -3);
		box01.rotation.y = Math.PI * 0.1;
		box01.scale.set(6, 12, 6);
		box01.castShadow = true;

		box02.position.set(3.5, -7, 3);
		box02.rotation.y = Math.PI * -0.1;
		box02.scale.set(6, 6, 6);
		box02.castShadow = true;

		environment.add(plane00, plane01, plane02, plane03, plane04, plane05, plane06, plane07);
		actors.add(box01, box02);

		scene.add(environment, actors);

		// Passes.

		const normalPass = new NormalPass(scene, camera, {
			resolutionScale: 1.0
		});

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		const ssaoEffect = new SSAOEffect(camera, normalPass.renderTarget.texture, {
			blendFunction: BlendFunction.MULTIPLY,
			samples: 11,
			rings: 4,
			distanceThreshold: 0.6,
			distanceFalloff: 0.1,
			rangeThreshold: 0.0015,
			rangeFalloff: 0.01,
			luminanceInfluence: 0.7,
			radius: 18.25,
			scale: 1.0,
			bias: 0.5
		});

		ssaoEffect.blendMode.opacity.value = 1.5;

		const effectPass = new EffectPass(camera, smaaEffect, ssaoEffect);
		this.renderPass.renderToScreen = false;
		effectPass.renderToScreen = true;

		this.effect = ssaoEffect;
		this.effectPass = effectPass;
		this.normalPass = normalPass;

		composer.addPass(normalPass);
		composer.addPass(effectPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effectPass = this.effectPass;
		const effect = this.effect;
		const blendMode = effect.blendMode;
		const uniforms = effect.uniforms;

		const params = {
			"distance": {
				"threshold": uniforms.get("distanceCutoff").value.x,
				"falloff": uniforms.get("distanceCutoff").value.y - uniforms.get("distanceCutoff").value.x
			},
			"proximity": {
				"threshold": uniforms.get("proximityCutoff").value.x,
				"falloff": uniforms.get("proximityCutoff").value.y - uniforms.get("proximityCutoff").value.x
			},
			"lum influence": uniforms.get("luminanceInfluence").value,
			"scale": uniforms.get("scale").value,
			"bias": uniforms.get("bias").value,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(effect, "samples").min(1).max(32).step(1).onChange(() => effectPass.recompile());
		menu.add(effect, "rings").min(1).max(16).step(1).onChange(() => effectPass.recompile());
		menu.add(effect, "radius").min(0.01).max(50.0).step(0.01);

		menu.add(params, "lum influence").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("luminanceInfluence").value = params["lum influence"];

		});

		let f = menu.addFolder("Distance Cutoff");

		f.add(params.distance, "threshold").min(0.0).max(1.0).step(0.001).onChange(() => {

			effect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f.add(params.distance, "falloff").min(0.0).max(1.0).step(0.001).onChange(() => {

			effect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f = menu.addFolder("Proximity Cutoff");

		f.add(params.proximity, "threshold").min(0.0).max(0.05).step(0.0001).onChange(() => {

			effect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		f.add(params.proximity, "falloff").min(0.0).max(0.1).step(0.0001).onChange(() => {

			effect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		menu.add(params, "bias").min(-1.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("bias").value = params.bias;

		});

		menu.add(params, "scale").min(0.0).max(2.0).step(0.001).onChange(() => {

			uniforms.get("scale").value = params.scale;

		});

		menu.add(params, "opacity").min(0.0).max(3.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			effectPass.recompile();

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		this.renderer.dispose();

	}

}
