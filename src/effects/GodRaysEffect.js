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
	WebGLRenderTarget
} from "three";

import { DepthMaskMaterial, KernelSize, GodRaysMaterial } from "../materials";
import { BlurPass, ClearPass, RenderPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/texture/shader.frag";

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
	 * @param {Number} [options.width=BlurPass.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=BlurPass.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
	 * @param {Number} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
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
		width = BlurPass.AUTO_SIZE,
		height = BlurPass.AUTO_SIZE,
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

		this.renderTargetX = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetX.texture.name = "GodRays.TargetX";

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();
		this.renderTargetY.texture.name = "GodRays.TargetY";
		this.uniforms.get("texture").value = this.renderTargetY.texture;

		/**
		 * A render target for the light scene.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetLight = this.renderTargetX.clone();
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

		/**
		 * A blur pass that reduces aliasing artifacts and makes the light softer.
		 *
		 * Disable this pass to improve performance.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(new DepthMaskMaterial());

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

		return this.renderTargetY.texture;

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
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.blurPass.width;

	}

	/**
	 * Sets the render width.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render height and aspect ratio.
	 *
	 * @type {Number}
	 */

	set width(value) {

		const blurPass = this.blurPass;
		blurPass.width = value;

		this.renderTargetX.setSize(blurPass.width, blurPass.height);
		this.renderTargetY.setSize(blurPass.width, blurPass.height);
		this.renderTargetLight.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.blurPass.height;

	}

	/**
	 * Sets the render height.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render width and aspect ratio.
	 *
	 * @type {Number}
	 */

	set height(value) {

		const blurPass = this.blurPass;
		blurPass.height = value;

		this.renderTargetX.setSize(blurPass.width, blurPass.height);
		this.renderTargetY.setSize(blurPass.width, blurPass.height);
		this.renderTargetLight.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.godRaysMaterial.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
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
	 * @deprecated Adjust the width or height instead.
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	setResolutionScale(scale) {

		const originalSize = this.blurPass.getOriginalSize();
		this.blurPass.setResolutionScale(scale);
		this.setSize(originalSize.x, originalSize.y);

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
		material.uniforms.depthBuffer1.value = this.renderTargetLight.depthTexture;

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

		const renderTargetX = this.renderTargetX;
		const renderTargetLight = this.renderTargetLight;

		if(!matrixAutoUpdate) {

			// Remember the local transformation to restore it later.
			m.copy(lightSource.matrix);

		}

		// Enable depth write for the light scene render pass.
		lightSource.material.depthWrite = true;

		// The light source may be inside a group; apply all transformations.
		lightSource.matrixAutoUpdate = false;
		lightSource.updateWorldMatrix(true, false);
		lightSource.matrix.copy(lightSource.matrixWorld);

		// Render the light source and mask it based on depth.
		this.lightScene.add(lightSource);
		this.renderPassLight.render(renderer, renderTargetLight);
		this.clearPass.render(renderer, renderTargetX);
		this.depthMaskPass.render(renderer, renderTargetLight, renderTargetX);

		// Restore the original values.
		lightSource.material.depthWrite = false;
		lightSource.matrixAutoUpdate = matrixAutoUpdate;

		if(!matrixAutoUpdate) {

			lightSource.matrix.copy(m);

		}

		if(parent !== null) {

			parent.add(lightSource);

		}

		// Calculate the screen light position and translate it to [0.0, 1.0].
		v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);
		this.screenPosition.set(
			Math.max(0.0, Math.min(1.0, (v.x + 1.0) * 0.5)),
			Math.max(0.0, Math.min(1.0, (v.y + 1.0) * 0.5)),
		);

		if(this.blur) {

			// Blur the masked scene to reduce artifacts.
			this.blurPass.render(renderer, renderTargetX, renderTargetX);

		}

		// Blur the masked scene along radial lines towards the light source.
		this.godRaysPass.render(renderer, renderTargetX, this.renderTargetY);

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

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);
		this.renderTargetLight.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.blurPass.initialize(renderer, alpha);
		this.renderPassLight.initialize(renderer, alpha);
		this.depthMaskPass.initialize(renderer, alpha);
		this.godRaysPass.initialize(renderer, alpha);

		if(!alpha) {

			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;
			this.renderTargetLight.texture.format = RGBFormat;

		}

	}

}
