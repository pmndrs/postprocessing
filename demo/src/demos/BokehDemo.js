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
	BokehEffect,
	DepthEffect,
	EffectPass,
	SMAAEffect,
	VignetteEffect
} from "../../../src";

/**
 * A bokeh demo setup.
 */

export class BokehDemo extends PostProcessingDemo {

	/**
	 * Constructs a new bokeh demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("bokeh", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A bokeh pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.bokehPass = null;

		/**
		 * A depth visualization pass.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.depthPass = null;

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

		const bokehEffect = new BokehEffect({
			focus: 0.32,
			dof: 0.02,
			aperture: 0.015,
			maxBlur: 0.0125
		});

		const smaaPass = new EffectPass(camera, smaaEffect);
		const bokehPass = new EffectPass(camera, bokehEffect, new VignetteEffect());
		const depthPass = new EffectPass(camera, new DepthEffect());

		this.renderPass.renderToScreen = false;
		smaaPass.renderToScreen = true;
		depthPass.enabled = false;

		this.effect = bokehEffect;
		this.bokehPass = bokehPass;
		this.depthPass = depthPass;

		composer.addPass(bokehPass);
		composer.addPass(depthPass);
		composer.addPass(smaaPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const bokehPass = this.bokehPass;
		const depthPass = this.depthPass;
		const effect = this.effect;
		const uniforms = effect.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"focus": uniforms.get("focus").value,
			"dof": uniforms.get("dof").value,
			"aperture": uniforms.get("aperture").value,
			"blur": uniforms.get("maxBlur").value,
			"show depth": depthPass.enabled,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("focus").value = params.focus;

		});

		menu.add(params, "dof").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.get("dof").value = params.dof;

		});

		menu.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(() => {

			uniforms.get("aperture").value = params.aperture;

		});

		menu.add(params, "blur").min(0.0).max(0.1).step(0.001).onChange(() => {

			uniforms.get("maxBlur").value = params.blur;

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			bokehPass.recompile();

		});

		menu.add(params, "show depth").onChange(() => {

			bokehPass.enabled = !params["show depth"];
			depthPass.enabled = params["show depth"];

		});

	}

}
