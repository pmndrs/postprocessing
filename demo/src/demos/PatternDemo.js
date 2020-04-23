import { Color, PerspectiveCamera, Vector3 } from "three";
import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import * as Sponza from "./objects/Sponza.js";

import {
	BlendFunction,
	DotScreenEffect,
	EdgeDetectionMode,
	GridEffect,
	EffectPass,
	ScanlineEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A pattern demo setup.
 */

export class PatternDemo extends PostProcessingDemo {

	/**
	 * Constructs a new pattern demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("pattern", composer);

		/**
		 * A dot-screen effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.dotScreenEffect = null;

		/**
		 * A grid effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.gridEffect = null;

		/**
		 * A scanline effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.scanlineEffect = null;

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
		camera.position.set(-9, 0.5, 0);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 3, -3.5);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0xeeeeee);

		// Lights.

		scene.add(...Sponza.createLights());

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

		const dotScreenEffect = new DotScreenEffect({
			blendFunction: BlendFunction.LIGHTEN,
			scale: 0.24,
			angle: Math.PI * 0.58
		});

		const gridEffect = new GridEffect({
			blendFunction: BlendFunction.SKIP,
			scale: 1.75,
			lineWidth: 0.25
		});

		const scanlineEffect = new ScanlineEffect({
			blendFunction: BlendFunction.MULTIPLY,
			density: 1.0
		});

		scanlineEffect.blendMode.opacity.value = 0.25;

		const pass = new EffectPass(
			camera,
			smaaEffect,
			dotScreenEffect,
			gridEffect,
			scanlineEffect
		);

		this.dotScreenEffect = dotScreenEffect;
		this.gridEffect = gridEffect;
		this.scanlineEffect = scanlineEffect;
		this.pass = pass;

		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.pass;
		const dotScreenEffect = this.dotScreenEffect;
		const gridEffect = this.gridEffect;
		const scanlineEffect = this.scanlineEffect;

		const params = {
			dotScreen: {
				"angle": Math.PI * 0.58,
				"scale": dotScreenEffect.uniforms.get("scale").value,
				"opacity": dotScreenEffect.blendMode.opacity.value,
				"blend mode": dotScreenEffect.blendMode.blendFunction
			},
			grid: {
				"scale": gridEffect.getScale(),
				"line width": gridEffect.getLineWidth(),
				"opacity": gridEffect.blendMode.opacity.value,
				"blend mode": gridEffect.blendMode.blendFunction
			},
			scanline: {
				"density": scanlineEffect.getDensity(),
				"opacity": scanlineEffect.blendMode.opacity.value,
				"blend mode": scanlineEffect.blendMode.blendFunction
			}
		};

		let folder = menu.addFolder("Dot Screen");

		folder.add(params.dotScreen, "angle").min(0.0).max(Math.PI).step(0.001).onChange(() => {

			dotScreenEffect.setAngle(params.dotScreen.angle);

		});

		folder.add(params.dotScreen, "scale").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.uniforms.get("scale").value = params.dotScreen.scale;

		});

		folder.add(params.dotScreen, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.blendMode.opacity.value = params.dotScreen.opacity;

		});

		folder.add(params.dotScreen, "blend mode", BlendFunction).onChange(() => {

			dotScreenEffect.blendMode.blendFunction = Number.parseInt(params.dotScreen["blend mode"]);
			pass.recompile();

		});

		folder.open();

		folder = menu.addFolder("Grid");

		folder.add(params.grid, "scale").min(0.01).max(3.0).step(0.01).onChange(() => {

			gridEffect.setScale(params.grid.scale);

		});

		folder.add(params.grid, "line width").min(0.0).max(1.0).step(0.01).onChange(() => {

			gridEffect.setLineWidth(params.grid["line width"]);

		});

		folder.add(params.grid, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			gridEffect.blendMode.opacity.value = params.grid.opacity;

		});

		folder.add(params.grid, "blend mode", BlendFunction).onChange(() => {

			gridEffect.blendMode.blendFunction = Number.parseInt(params.grid["blend mode"]);
			pass.recompile();

		});

		folder.open();

		folder = menu.addFolder("Scanline");

		folder.add(params.scanline, "density").min(0.001).max(2.0).step(0.001).onChange(() => {

			scanlineEffect.setDensity(params.scanline.density);

		});

		folder.add(params.scanline, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			scanlineEffect.blendMode.opacity.value = params.scanline.opacity;

		});

		folder.add(params.scanline, "blend mode", BlendFunction).onChange(() => {

			scanlineEffect.blendMode.blendFunction = Number.parseInt(params.scanline["blend mode"]);
			pass.recompile();

		});

		folder.open();

	}

}
