import { Color, PerspectiveCamera, Vector3 } from "three";
import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import * as Sponza from "./objects/Sponza.js";

import {
	BlendFunction,
	ColorChannel,
	DepthDownsamplingPass,
	EdgeDetectionMode,
	EffectPass,
	NormalPass,
	SSAOEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect
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
		 * An SSAO effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.ssaoEffect = null;

		/**
		 * A texture effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.textureEffect = null;

		/**
		 * A depth downsampling pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.depthDownsamplingPass = null;

		/**
		 * An effect pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass = null;

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
		const capabilities = renderer.capabilities;

		// Camera.

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 1000);
		camera.position.set(9.45, 1.735, 0.75);
		this.camera = camera;

		// Controls.

		const target = new Vector3(8.45, 1.65, 0.6);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.translation = 2.0;
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

		const normalPass = new NormalPass(scene, camera);
		const depthDownsamplingPass = new DepthDownsamplingPass({
			normalBuffer: normalPass.texture,
			resolutionScale: 0.5
		});

		const normalDepthBuffer = capabilities.isWebGL2 ?
			depthDownsamplingPass.texture : null;

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.setEdgeDetectionThreshold(0.05);

		// Note: Thresholds and falloff correspond to camera near/far.
		// Example: worldDistance = distanceThreshold * (camera.far - camera.near)
		const ssaoEffect = new SSAOEffect(camera, normalPass.texture, {
			blendFunction: BlendFunction.MULTIPLY,
			distanceScaling: true,
			depthAwareUpsampling: true,
			normalDepthBuffer,
			samples: 9,
			rings: 7,
			distanceThreshold: 0.02,	// Render up to a distance of ~20 world units
			distanceFalloff: 0.0025,	// with an additional ~2.5 units of falloff.
			rangeThreshold: 0.0003,		// Occlusion proximity of ~0.3 world units
			rangeFalloff: 0.0001,			// with ~0.1 units of falloff.
			luminanceInfluence: 0.7,
			minRadiusScale: 0.33,
			radius: 0.1,
			intensity: 1.33,
			bias: 0.025,
			fade: 0.01,
			color: null,
			resolutionScale: 0.5
		});

		const textureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: depthDownsamplingPass.texture
		});

		const effectPass = new EffectPass(camera, smaaEffect, ssaoEffect, textureEffect);

		this.ssaoEffect = ssaoEffect;
		this.textureEffect = textureEffect;
		this.depthDownsamplingPass = depthDownsamplingPass;
		this.effectPass = effectPass;

		composer.addPass(normalPass);

		if(capabilities.isWebGL2) {

			composer.addPass(depthDownsamplingPass);

		} else {

			console.log("WebGL 2 not supported, falling back to naive depth downsampling");

		}

		composer.addPass(effectPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const color = new Color();
		const capabilities = this.composer.getRenderer().capabilities;

		const effectPass = this.effectPass;
		const depthDownsamplingPass = this.depthDownsamplingPass;

		const ssaoEffect = this.ssaoEffect;
		const textureEffect = this.textureEffect;
		const blendMode = ssaoEffect.blendMode;
		const uniforms = ssaoEffect.ssaoMaterial.uniforms;

		const RenderMode = {
			DEFAULT: 0,
			NORMALS: 1,
			DEPTH: 2
		};

		const params = {
			"distance": {
				"threshold": uniforms.distanceCutoff.value.x,
				"falloff": uniforms.distanceCutoff.value.y - uniforms.distanceCutoff.value.x
			},
			"proximity": {
				"threshold": uniforms.proximityCutoff.value.x,
				"falloff": uniforms.proximityCutoff.value.y - uniforms.proximityCutoff.value.x
			},
			"upsampling": {
				"enabled": ssaoEffect.defines.has("DEPTH_AWARE_UPSAMPLING"),
				"threshold": Number(ssaoEffect.defines.get("THRESHOLD"))
			},
			"distanceScaling": {
				"enabled": ssaoEffect.distanceScaling,
				"min scale": uniforms.minRadiusScale.value
			},
			"lum influence": ssaoEffect.uniforms.get("luminanceInfluence").value,
			"intensity": uniforms.intensity.value,
			"bias": uniforms.bias.value,
			"fade": uniforms.fade.value,
			"render mode": RenderMode.DEFAULT,
			"resolution": ssaoEffect.resolution.scale,
			"color": 0x000000,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		function toggleRenderMode() {

			const mode = Number(params["render mode"]);

			if(mode === RenderMode.DEPTH) {

				textureEffect.setTextureSwizzleRGBA(ColorChannel.ALPHA);

			} else if(mode === RenderMode.NORMALS) {

				textureEffect.setTextureSwizzleRGBA(
					ColorChannel.RED,
					ColorChannel.GREEN,
					ColorChannel.BLUE,
					ColorChannel.ALPHA
				);

			}

			textureEffect.blendMode.setBlendFunction((mode !== RenderMode.DEFAULT) ?
				BlendFunction.NORMAL : BlendFunction.SKIP);

		}

		if(capabilities.isWebGL2) {

			menu.add(params, "render mode", RenderMode).onChange(toggleRenderMode);

		}

		menu.add(params, "resolution").min(0.25).max(1.0).step(0.25).onChange(() => {

			ssaoEffect.resolution.scale = params.resolution;
			depthDownsamplingPass.resolution.scale = params.resolution;

		});

		menu.add(ssaoEffect, "samples").min(1).max(32).step(1);
		menu.add(ssaoEffect, "rings").min(1).max(16).step(1);
		menu.add(ssaoEffect, "radius").min(1e-6).max(1.0).step(0.001);

		let f = menu.addFolder("Distance Scaling");

		f.add(params.distanceScaling, "enabled").onChange(() => {

			ssaoEffect.distanceScaling = params.distanceScaling.enabled;

		});

		f.add(params.distanceScaling, "min scale").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.minRadiusScale.value = params.distanceScaling["min scale"];

		});

		if(capabilities.isWebGL2) {

			f = menu.addFolder("Depth-Aware Upsampling");

			f.add(params.upsampling, "enabled").onChange(() => {

				ssaoEffect.depthAwareUpsampling = params.upsampling.enabled;

			});

			f.add(params.upsampling, "threshold").min(0.0).max(1.0).step(0.001).onChange(() => {

				// Note: This threshold is not really supposed to be changed.
				ssaoEffect.defines.set("THRESHOLD", params.upsampling.threshold.toFixed(3));
				effectPass.recompile();

			});

		}

		f = menu.addFolder("Distance Cutoff");

		f.add(params.distance, "threshold").min(0.0).max(1.0).step(0.0001).onChange(() => {

			ssaoEffect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f.add(params.distance, "falloff").min(0.0).max(1.0).step(0.0001).onChange(() => {

			ssaoEffect.setDistanceCutoff(params.distance.threshold, params.distance.falloff);

		});

		f = menu.addFolder("Proximity Cutoff");

		f.add(params.proximity, "threshold").min(0.0).max(0.01).step(0.0001).onChange(() => {

			ssaoEffect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		f.add(params.proximity, "falloff").min(0.0).max(0.01).step(0.0001).onChange(() => {

			ssaoEffect.setProximityCutoff(params.proximity.threshold, params.proximity.falloff);

		});

		menu.add(params, "bias").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.bias.value = params.bias;

		});

		menu.add(params, "fade").min(0.0).max(1.0).step(0.001).onChange(() => {

			uniforms.fade.value = params.fade;

		});

		menu.add(params, "lum influence").min(0.0).max(1.0).step(0.001).onChange(() => {

			ssaoEffect.uniforms.get("luminanceInfluence").value = params["lum influence"];

		});

		menu.add(params, "intensity").min(1.0).max(4.0).step(0.01).onChange(() => {

			uniforms.intensity.value = params.intensity;

		});

		menu.addColor(params, "color").onChange(() => {

			ssaoEffect.color = (params.color === 0x000000) ? null :
				color.setHex(params.color).convertSRGBToLinear();

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.001).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.setBlendFunction(Number(params["blend mode"]));

		});

	}

}
