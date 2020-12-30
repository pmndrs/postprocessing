import { Color, PerspectiveCamera, Vector3 } from "three";
import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	DepthOfFieldEffect,
	DepthEffect,
	EdgeDetectionMode,
	EffectPass,
	KernelSize,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect,
	VignetteEffect
} from "../../../src";

/**
 * A depth of field demo setup.
 */

export class DepthOfFieldDemo extends PostProcessingDemo {

	/**
	 * Constructs a new depth of field demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("depth-of-field", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.depthEffect = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.vignetteEffect = null;

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.depthOfFieldEffect = null;

		/**
		 * A texture effect for the circle of confusion visualization.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.cocTextureEffect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass = null;

		/**
		 * An SMAA pass.
		 *
		 * SMAA is performed last in this demo because the CoC mask of the DoF
		 * effect introduces aliasing artifacts.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.smaaPass = null;

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
		const camera = new PerspectiveCamera(50, aspect, 0.3, 30);
		camera.position.set(-2.3684, 0.5964, -1.3052);
		this.camera = camera;

		// Controls.

		const target = new Vector3(-1.4265, 0.6513, -1.6365);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0xeeeeee);

		// Lights.

		scene.add(...Sponza.createLights());

		// Objects.

		scene.add(assets.get(Sponza.tag));

		// Passes.

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const depthOfFieldEffect = new DepthOfFieldEffect(camera, {
			focusDistance: 0.0,
			focalLength: 0.048,
			bokehScale: 2.0,
			height: 480
		});

		const depthEffect = new DepthEffect({
			blendFunction: BlendFunction.SKIP
		});

		const vignetteEffect = new VignetteEffect({
			eskil: false,
			offset: 0.35,
			darkness: 0.75
		});

		const cocTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: depthOfFieldEffect.renderTargetCoC.texture
		});

		const effectPass = new EffectPass(camera, depthOfFieldEffect, vignetteEffect, cocTextureEffect, depthEffect);
		const smaaPass = new EffectPass(camera, smaaEffect);

		this.depthEffect = depthEffect;
		this.vignetteEffect = vignetteEffect;
		this.depthOfFieldEffect = depthOfFieldEffect;
		this.cocTextureEffect = cocTextureEffect;

		this.effectPass = effectPass;
		this.smaaPass = smaaPass;

		composer.addPass(effectPass);
		composer.addPass(smaaPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const smaaPass = this.smaaPass;
		const effectPass = this.effectPass;

		const depthEffect = this.depthEffect;
		const vignetteEffect = this.vignetteEffect;
		const depthOfFieldEffect = this.depthOfFieldEffect;
		const cocTextureEffect = this.cocTextureEffect;

		const cocMaterial = depthOfFieldEffect.circleOfConfusionMaterial;
		const blendMode = depthOfFieldEffect.blendMode;

		const RenderMode = {
			DEFAULT: 0,
			DEPTH: 1,
			COC: 2
		};

		const params = {
			"coc": {
				"edge blur kernel": depthOfFieldEffect.blurPass.kernelSize,
				"focus": cocMaterial.uniforms.focusDistance.value,
				"focal length": cocMaterial.uniforms.focalLength.value
			},
			"vignette": {
				"enabled": true,
				"offset": vignetteEffect.uniforms.get("offset").value,
				"darkness": vignetteEffect.uniforms.get("darkness").value
			},
			"render mode": RenderMode.DEFAULT,
			"resolution": depthOfFieldEffect.resolution.height,
			"bokeh scale": depthOfFieldEffect.bokehScale,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		function toggleRenderMode() {

			const mode = Number(params["render mode"]);

			depthEffect.blendMode.setBlendFunction((mode === RenderMode.DEPTH) ? BlendFunction.NORMAL : BlendFunction.SKIP);
			cocTextureEffect.blendMode.setBlendFunction((mode === RenderMode.COC) ? BlendFunction.NORMAL : BlendFunction.SKIP);
			vignetteEffect.blendMode.setBlendFunction((mode === RenderMode.DEFAULT && params.vignette.enabled) ? BlendFunction.NORMAL : BlendFunction.SKIP);

			smaaPass.enabled = (mode === RenderMode.DEFAULT);
			effectPass.encodeOutput = (mode === RenderMode.DEFAULT);
			effectPass.renderToScreen = (mode !== RenderMode.DEFAULT);

		}

		menu.add(params, "render mode", RenderMode).onChange(toggleRenderMode);

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			depthOfFieldEffect.resolution.height = Number(params.resolution);

		});

		menu.add(params, "bokeh scale").min(1.0).max(5.0).step(0.001).onChange(() => {

			depthOfFieldEffect.bokehScale = params["bokeh scale"];

		});

		let folder = menu.addFolder("Circle of Confusion");

		folder.add(params.coc, "edge blur kernel", KernelSize).onChange(() => {

			depthOfFieldEffect.blurPass.kernelSize = Number(params.coc["edge blur kernel"]);

		});

		folder.add(params.coc, "focus").min(0.0).max(1.0).step(0.001).onChange(() => {

			cocMaterial.uniforms.focusDistance.value = params.coc.focus;

		});

		folder.add(params.coc, "focal length").min(0.0).max(1.0).step(0.0001).onChange(() => {

			cocMaterial.uniforms.focalLength.value = params.coc["focal length"];

		});

		folder.open();

		folder = menu.addFolder("Vignette");

		folder.add(params.vignette, "enabled").onChange(() => {

			vignetteEffect.blendMode.setBlendFunction(params.vignette.enabled ? BlendFunction.NORMAL : BlendFunction.SKIP);

		});

		folder.add(vignetteEffect, "eskil");

		folder.add(params.vignette, "offset").min(0.0).max(1.0).step(0.001).onChange(() => {

			vignetteEffect.uniforms.get("offset").value = params.vignette.offset;

		});

		folder.add(params.vignette, "darkness").min(0.0).max(1.0).step(0.001).onChange(() => {

			vignetteEffect.uniforms.get("darkness").value = params.vignette.darkness;

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.setBlendFunction(Number(params["blend mode"]));

		});

	}

}
