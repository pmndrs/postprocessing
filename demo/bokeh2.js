import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshBasicMaterial,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { Bokeh2Pass, RenderPass } from "../src";
import { Demo } from "./demo.js";

/**
 * A high quality bokeh demo setup.
 *
 * @class Bokeh2Demo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class Bokeh2Demo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A bokeh pass.
		 *
		 * @property bloomPass
		 * @type BloomPass
		 * @private
		 */

		this.bokehPass = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @method load
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space3/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		if(this.assets === null) {

			loadingManager.onProgress = (item, loaded, total) => {

				if(loaded === total) {

					this.assets = assets;
					this.initialise();
					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

		} else {

			this.initialise();
			callback();

		}

	}

	/**
	 * Creates the scene.
	 *
	 * @method initialise
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.minDistance = 2.5;
		this.controls.maxDistance = 40;

		// Camera.

		camera.near = 0.01;
		camera.far = 50;
		camera.position.set(3, 1, 3);
		camera.lookAt(this.controls.target);
		scene.add(camera);

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

		composer.addPass(new RenderPass(scene, camera));

		const pass = new Bokeh2Pass(camera, {
			rings: 3,
			samples: 2,
			showFocus: false,
			manualDoF: false,
			vignette: false,
			pentagon: false,
			shaderFocus: true,
			noise: true
		});

		pass.bokehMaterial.uniforms.focalStop.value = 64;
		pass.renderToScreen = true;
		this.bokehPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const pass = this.bokehPass;

		const params = {
			"rings": Number.parseInt(pass.bokehMaterial.defines.RINGS_INT),
			"samples": Number.parseInt(pass.bokehMaterial.defines.SAMPLES_INT),
			"focal stop": pass.bokehMaterial.uniforms.focalStop.value,
			"focal length": pass.bokehMaterial.uniforms.focalLength.value,
			"shader focus": pass.bokehMaterial.defines.SHADER_FOCUS !== undefined,
			"focal depth": pass.bokehMaterial.uniforms.focalDepth.value,
			"focus coord X": pass.bokehMaterial.uniforms.focusCoords.value.x,
			"focus coord Y": pass.bokehMaterial.uniforms.focusCoords.value.y,
			"max blur": pass.bokehMaterial.uniforms.maxBlur.value,
			"lum threshold": pass.bokehMaterial.uniforms.luminanceThreshold.value,
			"lum gain": pass.bokehMaterial.uniforms.luminanceGain.value,
			"bias": pass.bokehMaterial.uniforms.bias.value,
			"fringe": pass.bokehMaterial.uniforms.fringe.value,
			"dithering": pass.bokehMaterial.uniforms.ditherStrength.value,
			"vignette": pass.bokehMaterial.defines.VIGNETTE !== undefined,
			"pentagon": pass.bokehMaterial.defines.PENTAGON !== undefined,
			"manual DoF": pass.bokehMaterial.defines.MANUAL_DOF !== undefined,
			"show focus": pass.bokehMaterial.defines.SHOW_FOCUS !== undefined,
			"noise": pass.bokehMaterial.defines.NOISE !== undefined
		};

		let f = gui.addFolder("Focus");

		f.add(params, "show focus").onChange(function() {
			params["show focus"] ? pass.bokehMaterial.defines.SHOW_FOCUS = "1" : delete pass.bokehMaterial.defines.SHOW_FOCUS;
			pass.bokehMaterial.needsUpdate = true;
		});

		f.add(params, "shader focus").onChange(function() {
			params["shader focus"] ? pass.bokehMaterial.defines.SHADER_FOCUS = "1" : delete pass.bokehMaterial.defines.SHADER_FOCUS;
			pass.bokehMaterial.needsUpdate = true;
		});

		f.add(params, "manual DoF").onChange(function() {
			params["manual DoF"] ? pass.bokehMaterial.defines.MANUAL_DOF = "1" : delete pass.bokehMaterial.defines.MANUAL_DOF;
			pass.bokehMaterial.needsUpdate = true;
		});

		f.add(params, "focal stop").min(0.0).max(100.0).step(0.1).onChange(function() { pass.bokehMaterial.uniforms.focalStop.value = params["focal stop"]; });
		f.add(params, "focal depth").min(0.1).max(35.0).step(0.1).onChange(function() { pass.bokehMaterial.uniforms.focalDepth.value = params["focal depth"]; });
		f.add(params, "focus coord X").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.focusCoords.value.x = params["focus coord X"]; });
		f.add(params, "focus coord Y").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.focusCoords.value.y = params["focus coord Y"]; });

		f.open();

		f = gui.addFolder("Sampling");

		f.add(params, "rings").min(1).max(6).step(1).onChange(function() {
			pass.bokehMaterial.defines.RINGS_INT = params.rings.toFixed(0);
			pass.bokehMaterial.defines.RINGS_FLOAT = params.rings.toFixed(1);
			pass.bokehMaterial.needsUpdate = true;
		});

		f.add(params, "samples").min(1).max(6).step(1).onChange(function() {
			pass.bokehMaterial.defines.SAMPLES_INT = params.samples.toFixed(0);
			pass.bokehMaterial.defines.SAMPLES_FLOAT = params.samples.toFixed(1);
			pass.bokehMaterial.needsUpdate = true;
		});

		f = gui.addFolder("Blur");

		f.add(params, "max blur").min(0.0).max(1.0).step(0.001).onChange(function() { pass.bokehMaterial.uniforms.maxBlur.value = params["max blur"]; });
		f.add(params, "bias").min(0.0).max(3.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.bias.value = params.bias; });
		f.add(params, "fringe").min(0.0).max(2.0).step(0.05).onChange(function() { pass.bokehMaterial.uniforms.fringe.value = params.fringe; });

		f.add(params, "noise").onChange(function() {
			params.noise ? pass.bokehMaterial.defines.NOISE = "1" : delete pass.bokehMaterial.defines.NOISE;
			pass.bokehMaterial.needsUpdate = true;
		});

		f.add(params, "dithering").min(0.0).max(0.01).step(0.0001).onChange(function() { pass.bokehMaterial.uniforms.ditherStrength.value = params.dithering; });

		f.add(params, "pentagon").onChange(function() {
			params.pentagon ? pass.bokehMaterial.defines.PENTAGON = "1" : delete pass.bokehMaterial.defines.PENTAGON;
			pass.bokehMaterial.needsUpdate = true;
		});

		f.open();

		f = gui.addFolder("Luminosity");

		f.add(params, "lum threshold").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.luminanceThreshold.value = params["lum threshold"]; });
		f.add(params, "lum gain").min(0.0).max(4.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.luminanceGain.value = params["lum gain"]; });

		gui.add(params, "vignette").onChange(function() {
			params.vignette ? pass.bokehMaterial.defines.VIGNETTE = "1" : delete pass.bokehMaterial.defines.VIGNETTE;
			pass.bokehMaterial.needsUpdate = true;
		});

	}

}
