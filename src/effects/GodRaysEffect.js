import {
	Color,
	DepthTexture,
	LinearFilter,
	Matrix4,
	RGBFormat,
	Scene,
	Uniform,
	Vector2,
	Vector3,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Resizer } from "../core";
import { DepthMaskMaterial, KernelSize, GodRaysMaterial } from "../materials";
import { BlurPass, ClearPass, RenderPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/god-rays/shader.frag";

/**
 * A vector.
 *
 * @type {Vector3}
 * @private
 */

const v = new Vector3();

/**
 * A matrix.
 *
 * @type {Matrix4}
 * @private
 */

const m = new Matrix4();

/**
 * A god rays effect.
 */

export class GodRaysEffect extends Effect {

	/**
	 * Constructs a new god rays effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Mesh|Points} lightSource - The light source. Must not write depth and has to be flagged as transparent.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Number} [options.samples=60.0] - The number of samples per pixel.
	 * @param {Number} [options.density=0.96] - The density of the light rays.
	 * @param {Number} [options.decay=0.9] - An illumination decay factor.
	 * @param {Number} [options.weight=0.4] - A light ray weight factor.
	 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
	 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
	 * @param {Boolean} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
	 */

	constructor(camera, lightSource, {
		blendFunction = BlendFunction.SCREEN,
		samples = 60.0,
		density = 0.96,
		decay = 0.9,
		weight = 0.4,
		exposure = 0.6,
		clampMax = 1.0,
		resolutionScale = 0.5,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		kernelSize = KernelSize.SMALL,
		blur = true
	} = {}) {

		super("GodRaysEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.DEPTH,

			uniforms: new Map([
				["texture", new Uniform(null)]
			])

		});

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * The light source.
		 *
		 * @type {Mesh|Points}
		 * @private
		 */

		this.lightSource = lightSource;
		this.lightSource.material.depthWrite = false;
		this.lightSource.material.transparent = true;

		/**
		 * A scene that only contains the light source.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.lightScene = new Scene();

		/**
		 * The light position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = new Vector2();

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetA = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetA.texture.name = "GodRays.Target.A";

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "GodRays.Target.B";
		this.uniforms.get("texture").value = this.renderTargetB.texture;

		/**
		 * A render target for the light scene.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetLight = this.renderTargetA.clone();
		this.renderTargetLight.texture.name = "GodRays.Light";
		this.renderTargetLight.depthBuffer = true;
		this.renderTargetLight.depthTexture = new DepthTexture();

		/**
		 * A pass that only renders the light source.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassLight = new RenderPass(this.lightScene, camera);
		this.renderPassLight.getClearPass().overrideClearColor = new Color(0x000000);

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(true, false, false);
		this.clearPass.overrideClearColor = new Color(0x000000);

		/**
		 * A blur pass that reduces aliasing artifacts and makes the light softer.
		 *
		 * Disable this pass to improve performance.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });
		this.blurPass.resolution.resizable = this;

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(((depthTexture) => {

			const material = new DepthMaskMaterial();
			material.uniforms.depthBuffer1.value = depthTexture;

			return material;

		})(this.renderTargetLight.depthTexture));

		/**
		 * A god rays blur pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.godRaysPass = new ShaderPass((() => {

			const material = new GodRaysMaterial(this.screenPosition);
			material.uniforms.density.value = density;
			material.uniforms.decay.value = decay;
			material.uniforms.weight.value = weight;
			material.uniforms.exposure.value = exposure;
			material.uniforms.clampMax.value = clampMax;

			return material;

		})());

		this.samples = samples;
		this.blur = blur;

	}

	/**
	 * A texture that contains the intermediate result of this effect.
	 *
	 * This texture will be applied to the scene colors unless the blend function
	 * is set to `SKIP`.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTargetB.texture;

	}

	/**
	 * The internal god rays material.
	 *
	 * @type {GodRaysMaterial}
	 */

	get godRaysMaterial() {

		return this.godRaysPass.getFullscreenMaterial();

	}

	/**
	 * The resolution of this effect.
	 *
	 * @type {Resizer}
	 */

	get resolution() {

		return this.blurPass.resolution;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	get width() {

		return this.resolution.width;

	}

	/**
	 * Sets the render width.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	set width(value) {

		this.resolution.width = value;

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	get height() {

		return this.resolution.height;

	}

	/**
	 * Sets the render height.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	set height(value) {

		this.resolution.height = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
	 */

	get dithering() {

		return this.godRaysMaterial.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
	 */

	set dithering(value) {

		const material = this.godRaysMaterial;

		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * Indicates whether the god rays should be blurred to reduce artifacts.
	 *
	 * @type {Boolean}
	 */

	get blur() {

		return this.blurPass.enabled;

	}

	/**
	 * @type {Boolean}
	 */

	set blur(value) {

		this.blurPass.enabled = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * Sets the blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

	}

	/**
	 * The number of samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return this.godRaysMaterial.samples;

	}

	/**
	 * A higher sample count improves quality at the cost of performance.
	 *
	 * @type {Number}
	 */

	set samples(value) {

		this.godRaysMaterial.samples = value;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.depthMaskPass.getFullscreenMaterial();
		material.uniforms.depthBuffer0.value = depthTexture;
		material.defines.DEPTH_PACKING_0 = depthPacking.toFixed(0);

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const lightSource = this.lightSource;
		const parent = lightSource.parent;
		const matrixAutoUpdate = lightSource.matrixAutoUpdate;

		const renderTargetA = this.renderTargetA;
		const renderTargetLight = this.renderTargetLight;

		// Enable depth write for the light scene render pass.
		lightSource.material.depthWrite = true;

		// Update the world matrix.
		lightSource.matrixAutoUpdate = false;
		lightSource.updateWorldMatrix(true, false);

		if(parent !== null) {

			if(!matrixAutoUpdate) {

				// Remember the local transformation to restore it later.
				m.copy(lightSource.matrix);

			}

			// Apply parent transformations.
			lightSource.matrix.copy(lightSource.matrixWorld);

		}

		// Render the light source and mask it based on depth.
		this.lightScene.add(lightSource);
		this.renderPassLight.render(renderer, renderTargetLight);
		this.clearPass.render(renderer, renderTargetA);
		this.depthMaskPass.render(renderer, renderTargetLight, renderTargetA);

		// Restore the original values.
		lightSource.material.depthWrite = false;
		lightSource.matrixAutoUpdate = matrixAutoUpdate;

		if(parent !== null) {

			if(!matrixAutoUpdate) {

				lightSource.matrix.copy(m);

			}

			parent.add(lightSource);

		}

		// Calculate the screen light position.
		v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);

		// Translate to [0.0, 1.0] and clamp to screen with a bias of 1.0.
		this.screenPosition.set(
			Math.min(Math.max((v.x + 1.0) * 0.5, -1.0), 2.0),
			Math.min(Math.max((v.y + 1.0) * 0.5, -1.0), 2.0)
		);

		if(this.blur) {

			// Blur the masked scene to reduce artifacts.
			this.blurPass.render(renderer, renderTargetA, renderTargetA);

		}

		// Blur the masked scene along radial lines towards the light source.
		this.godRaysPass.render(renderer, renderTargetA, this.renderTargetB);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.blurPass.setSize(width, height);
		this.renderPassLight.setSize(width, height);
		this.depthMaskPass.setSize(width, height);
		this.godRaysPass.setSize(width, height);

		const w = this.resolution.width;
		const h = this.resolution.height;

		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);
		this.renderTargetLight.setSize(w, h);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.renderPassLight.initialize(renderer, alpha, frameBufferType);
		this.depthMaskPass.initialize(renderer, alpha, frameBufferType);
		this.godRaysPass.initialize(renderer, alpha, frameBufferType);

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTargetA.texture.format = RGBFormat;
			this.renderTargetB.texture.format = RGBFormat;
			this.renderTargetLight.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;
			this.renderTargetLight.texture.type = frameBufferType;

		}

	}

}
