import { Color, PerspectiveCamera, Vector3 } from "three";
import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

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
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

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

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 1000);
		camera.position.set(9.45, 1.735, 0.75);
		this.camera = camera;

		// Controls

		const target = new Vector3(8.45, 1.65, 0.6);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 2.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xeeeeee);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		// Passes

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

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

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

			effectPass.encodeOutput = (mode === RenderMode.DEFAULT);

		}

		if(capabilities.isWebGL2) {

			menu.add(params, "render mode", RenderMode).onChange(toggleRenderMode);

		}

		menu.add(params, "resolution").min(0.25).max(1.0).step(0.25).onChange((value) => {

			ssaoEffect.resolution.scale = value;
			depthDownsamplingPass.resolution.scale = value;

		});

		menu.add(ssaoEffect, "samples").min(1).max(32).step(1);
		menu.add(ssaoEffect, "rings").min(1).max(16).step(1);
		menu.add(ssaoEffect, "radius").min(1e-6).max(1.0).step(0.001);

		let f = menu.addFolder("Distance Scaling");

		f.add(params.distanceScaling, "enabled").onChange((value) => {

			ssaoEffect.distanceScaling = value.enabled;

		});

		f.add(params.distanceScaling, "min scale").min(0.0).max(1.0).step(0.001).onChange((value) => {

			uniforms.minRadiusScale.value = value;

		});

		if(capabilities.isWebGL2) {

			f = menu.addFolder("Depth-Aware Upsampling");

			f.add(params.upsampling, "enabled").onChange((value) => {

				ssaoEffect.depthAwareUpsampling = value;

			});

			f.add(params.upsampling, "threshold").min(0.0).max(1.0).step(0.001).onChange((value) => {

				// Note: This threshold is not really supposed to be changed.
				ssaoEffect.defines.set("THRESHOLD", value.toFixed(3));
				effectPass.recompile();

			});

		}

		f = menu.addFolder("Distance Cutoff");

		f.add(params.distance, "threshold").min(0.0).max(1.0).step(0.0001).onChange((value) => {

			ssaoEffect.setDistanceCutoff(value, params.distance.falloff);

		});

		f.add(params.distance, "falloff").min(0.0).max(1.0).step(0.0001).onChange((value) => {

			ssaoEffect.setDistanceCutoff(params.distance.threshold, value);

		});

		f = menu.addFolder("Proximity Cutoff");

		f.add(params.proximity, "threshold").min(0.0).max(0.01).step(0.0001).onChange((value) => {

			ssaoEffect.setProximityCutoff(value, params.proximity.falloff);

		});

		f.add(params.proximity, "falloff").min(0.0).max(0.01).step(0.0001).onChange((value) => {

			ssaoEffect.setProximityCutoff(params.proximity.threshold, value);

		});

		menu.add(params, "bias").min(0.0).max(1.0).step(0.001).onChange((value) => {

			uniforms.bias.value = value;

		});

		menu.add(params, "fade").min(0.0).max(1.0).step(0.001).onChange((value) => {

			uniforms.fade.value = value;

		});

		menu.add(params, "lum influence").min(0.0).max(1.0).step(0.001).onChange((value) => {

			ssaoEffect.uniforms.get("luminanceInfluence").value = value;

		});

		menu.add(params, "intensity").min(1.0).max(4.0).step(0.01).onChange((value) => {

			uniforms.intensity.value = value;

		});

		menu.addColor(params, "color").onChange((value) => {

			ssaoEffect.color = (value === 0x000000) ? null :
				color.setHex(value).convertSRGBToLinear();

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.001).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

	}

}
