import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	CylinderBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	RealisticBokehEffect,
	EffectPass,
	SMAAEffect,
	VignetteEffect
} from "../../../src";

/**
 * A bokeh demo setup.
 */

export class RealisticBokehDemo extends PostProcessingDemo {

	/**
	 * Constructs a new bokeh demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("realistic-bokeh", composer);

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

		const path = "textures/skies/space3/";
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

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50);
		camera.position.set(12.5, -0.3, 1.7);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.rotation = 0.000425;
		controls.settings.sensitivity.zoom = 0.15;
		controls.settings.zoom.minDistance = 11.5;
		controls.settings.zoom.maxDistance = 40.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x404040);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const geometry = new CylinderBufferGeometry(1, 1, 20, 6);
		const material = new MeshPhongMaterial({
			color: 0xffaaaa,
			flatShading: true,
			envMap: assets.get("sky")
		});

		const mesh = new Mesh(geometry, material);
		mesh.rotation.set(0, 0, Math.PI / 2);
		scene.add(mesh);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);

		const bokehEffect = new RealisticBokehEffect({
			focus: 1.55,
			focalLength: camera.getFocalLength(),
			luminanceThreshold: 0.325,
			luminanceGain: 2.0,
			bias: -0.35,
			fringe: 0.7,
			maxBlur: 2.5,
			rings: 5,
			samples: 5,
			showFocus: false,
			manualDoF: false,
			pentagon: true
		});

		const smaaPass = new EffectPass(camera, smaaEffect);
		const bokehPass = new EffectPass(camera, bokehEffect, new VignetteEffect());

		this.renderPass.renderToScreen = false;
		smaaPass.renderToScreen = true;

		this.effect = bokehEffect;
		this.pass = bokehPass;

		composer.addPass(bokehPass);
		composer.addPass(smaaPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;
		const effect = this.effect;
		const uniforms = effect.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"focus": uniforms.get("focus").value,
			"focal length": uniforms.get("focalLength").value,
			"threshold": uniforms.get("luminanceThreshold").value,
			"gain": uniforms.get("luminanceGain").value,
			"bias": uniforms.get("bias").value,
			"fringe": uniforms.get("fringe").value,
			"max": uniforms.get("maxBlur").value,
			"near start": 0.2,
			"near dist": 1.0,
			"far start": 0.2,
			"far dist": 2.0,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		// Object is 20 units long, actual maximum would be camera.far.
		menu.add(params, "focus").min(this.camera.near).max(20.0).step(0.01).onChange(() => {

			uniforms.get("focus").value = params.focus;

		});

		menu.add(params, "focal length").min(0.1).max(35.0).step(0.01).onChange(() => {

			uniforms.get("focalLength").value = params["focal length"];

		});

		menu.add(effect, "showFocus").onChange(() => pass.recompile());

		let folder = menu.addFolder("Depth of Field");

		folder.add(effect, "manualDoF").onChange(() => pass.recompile());

		folder.add(params, "near start").min(0.0).max(1.0).step(0.001).onChange(() => {

			if(uniforms.has("dof")) {

				uniforms.get("dof").value.x = params["near start"];

			}

		});

		folder.add(params, "near dist").min(0.0).max(2.0).step(0.001).onChange(() => {

			if(uniforms.has("dof")) {

				uniforms.get("dof").value.y = params["near dist"];

			}

		});

		folder.add(params, "far start").min(0.0).max(1.0).step(0.001).onChange(() => {

			if(uniforms.has("dof")) {

				uniforms.get("dof").value.z = params["far start"];

			}

		});

		folder.add(params, "far dist").min(0.0).max(3.0).step(0.001).onChange(() => {

			if(uniforms.has("dof")) {

				uniforms.get("dof").value.w = params["far dist"];

			}

		});

		folder = menu.addFolder("Blur");

		folder.add(params, "max").min(0.0).max(5.0).step(0.001).onChange(() => {

			uniforms.get("maxBlur").value = params.max;

		});

		folder.add(params, "bias").min(-1.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("bias").value = params.bias;

		});

		folder.add(params, "fringe").min(0.0).max(5.0).step(0.001).onChange(() => {

			uniforms.get("fringe").value = params.fringe;

		});

		folder.add(effect, "rings").min(1).max(8).step(1).onChange(() => pass.recompile());
		folder.add(effect, "samples").min(1).max(8).step(1).onChange(() => pass.recompile());

		folder.add(effect, "pentagon").onChange(() => pass.recompile());

		folder = menu.addFolder("Luminance");

		folder.add(params, "threshold").min(0.0).max(1.0).step(0.01).onChange(() => {

			uniforms.get("luminanceThreshold").value = params.threshold;

		});

		folder.add(params, "gain").min(0.0).max(4.0).step(0.01).onChange(() => {

			uniforms.get("luminanceGain").value = params.gain;

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

		menu.add(pass, "dithering");

	}

}
