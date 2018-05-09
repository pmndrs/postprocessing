import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";
import { RealisticBokehPass } from "../../../src";

/**
 * A high quality bokeh demo setup.
 */

export class RealisticBokehDemo extends PostProcessingDemo {

	/**
	 * Constructs a new bokeh2 demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("realistic-bokeh", composer);

		/**
		 * A bokeh pass.
		 *
		 * @type {RealisticBokehPass}
		 * @private
		 */

		this.bokehPass = null;

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

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
		camera.position.set(3, 1, 3);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 0.25;
		controls.settings.zoom.minDistance = 2.5;
		controls.settings.zoom.maxDistance = 40.0;
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

		// Objects.

		const geometry = new SphereBufferGeometry(1, 64, 64);
		const material = new MeshBasicMaterial({
			color: 0xffff00,
			envMap: assets.get("sky")
		});

		const mesh = new Mesh(geometry, material);
		scene.add(mesh);

		// Passes.

		const pass = new RealisticBokehPass(camera, {
			rings: 5,
			samples: 5,
			showFocus: false,
			manualDoF: true,
			vignette: true,
			pentagon: true,
			shaderFocus: true,
			noise: false,
			maxBlur: 2.0,
			luminanceThreshold: 0.15,
			luminanceGain: 3.5,
			bias: 0.25,
			fringe: 0.33
		});

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.bokehPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.bokehPass;

		const params = {
			"rings": Number.parseInt(pass.material.defines.RINGS_INT),
			"samples": Number.parseInt(pass.material.defines.SAMPLES_INT),
			"focal stop": pass.material.uniforms.focalStop.value,
			"focal length": pass.material.uniforms.focalLength.value,
			"shader focus": pass.material.defines.SHADER_FOCUS !== undefined,
			"focal depth": pass.material.uniforms.focalDepth.value,
			"focus coord X": pass.material.uniforms.focusCoords.value.x,
			"focus coord Y": pass.material.uniforms.focusCoords.value.y,
			"max blur": pass.material.uniforms.maxBlur.value,
			"lum threshold": pass.material.uniforms.luminanceThreshold.value,
			"lum gain": pass.material.uniforms.luminanceGain.value,
			"bias": pass.material.uniforms.bias.value,
			"fringe": pass.material.uniforms.fringe.value,
			"dithering": pass.material.uniforms.ditherStrength.value,
			"vignette": pass.material.defines.VIGNETTE !== undefined,
			"pentagon": pass.material.defines.PENTAGON !== undefined,
			"manual DoF": pass.material.defines.MANUAL_DOF !== undefined,
			"show focus": pass.material.defines.SHOW_FOCUS !== undefined,
			"noise": pass.material.defines.NOISE !== undefined
		};

		let f = menu.addFolder("Focus");

		f.add(params, "show focus").onChange(function() {

			pass.material.setShowFocusEnabled(params["show focus"]);

		});

		f.add(params, "shader focus").onChange(function() {

			pass.material.setShaderFocusEnabled(params["shader focus"]);

		});

		f.add(params, "manual DoF").onChange(function() {

			pass.material.setManualDepthOfFieldEnabled(params["manual DoF"]);

		});

		f.add(params, "focal stop").min(0.0).max(100.0).step(0.1).onChange(function() {

			pass.material.uniforms.focalStop.value = params["focal stop"];

		});

		f.add(params, "focal depth").min(0.1).max(35.0).step(0.1).onChange(function() {

			pass.material.uniforms.focalDepth.value = params["focal depth"];

		});

		f.add(params, "focus coord X").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.focusCoords.value.x = params["focus coord X"];

		});

		f.add(params, "focus coord Y").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.focusCoords.value.y = params["focus coord Y"];

		});

		f.open();

		f = menu.addFolder("Sampling");

		f.add(params, "rings").min(1).max(6).step(1).onChange(function() {

			pass.material.defines.RINGS_INT = params.rings.toFixed(0);
			pass.material.defines.RINGS_FLOAT = params.rings.toFixed(1);
			pass.material.needsUpdate = true;

		});

		f.add(params, "samples").min(1).max(6).step(1).onChange(function() {

			pass.material.defines.SAMPLES_INT = params.samples.toFixed(0);
			pass.material.defines.SAMPLES_FLOAT = params.samples.toFixed(1);
			pass.material.needsUpdate = true;

		});

		f = menu.addFolder("Blur");

		f.add(params, "max blur").min(0.0).max(10.0).step(0.001).onChange(function() {

			pass.material.uniforms.maxBlur.value = params["max blur"];

		});

		f.add(params, "bias").min(0.0).max(3.0).step(0.01).onChange(function() {

			pass.material.uniforms.bias.value = params.bias;

		});

		f.add(params, "fringe").min(0.0).max(2.0).step(0.05).onChange(function() {

			pass.material.uniforms.fringe.value = params.fringe;

		});

		f.add(params, "noise").onChange(function() {

			pass.material.setNoiseEnabled(params.noise);

		});

		f.add(params, "dithering").min(0.0).max(0.01).step(0.0001).onChange(function() {

			pass.material.uniforms.ditherStrength.value = params.dithering;

		});

		f.add(params, "pentagon").onChange(function() {

			pass.material.setPentagonEnabled(params.pentagon);

		});

		f.open();

		f = menu.addFolder("Luminosity");

		f.add(params, "lum threshold").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.material.uniforms.luminanceThreshold.value = params["lum threshold"];

		});

		f.add(params, "lum gain").min(0.0).max(4.0).step(0.01).onChange(function() {

			pass.material.uniforms.luminanceGain.value = params["lum gain"];

		});

		menu.add(params, "vignette").onChange(function() {

			pass.material.setVignetteEnabled(params.vignette);

		});

	}

}
