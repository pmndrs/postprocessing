import { LinearFilter, RGBFormat, Uniform, WebGLRenderTarget } from "three";
import { Resizer } from "../core";
import { BokehMaterial, CircleOfConfusionMaterial, CopyMaterial, KernelSize } from "../materials";
import { BlurPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/depth-of-field/shader.frag";

/**
 * A depth of field effect.
 *
 * Based on an implementation by Steve Avery:
 * https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/
 */

export class DepthOfFieldEffect extends Effect {

	/**
	 * Constructs a new depth of field effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.focusDistance=0.0] - The normalized focus distance. Range is [0.0, 1.0].
	 * @param {Number} [options.focalLength=0.1] - The focal length.
	 * @param {Number} [options.lensSize=1.0] - The diameter of the entrance pupil.
	 * @param {Number} [options.fStop=1.4] - The ratio of the focal length to the diameter of the entrance pupil (aperture).
	 * @param {Number} [options.scale=1.0] - The blur scale.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 */

	constructor(camera, {
		blendFunction = BlendFunction.NORMAL,
		focusDistance = 0.0,
		focalLength = 0.1,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE
	} = {}) {

		super("DepthOfFieldEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.DEPTH,

			uniforms: new Map([
				["nearBuffer", new Uniform(null)],
				["farBuffer", new Uniform(null)],
				["cocNearBuffer", new Uniform(null)],
				["cocFarBuffer", new Uniform(null)],
				["scale", new Uniform(2.0)]
			])

		});

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DoF.Intermediate";
		this.renderTarget.texture.generateMipmaps = false;

		/**
		 * A render target for the far pixels.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetNear = this.renderTarget.clone();
		this.renderTargetNear.texture.name = "DoF.Near";

		this.uniforms.get("nearBuffer").value = this.renderTargetNear.texture;

		/**
		 * A render target for the far pixels.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetFar = this.renderTarget.clone();
		this.renderTargetFar.texture.name = "DoF.Far";

		this.uniforms.get("farBuffer").value = this.renderTargetFar.texture;

		/**
		 * A render target for the negative circle of confusion values.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetCoCNear = this.renderTarget.clone();
		this.renderTargetCoCNear.texture.name = "DoF.CoC.Near";
		this.renderTargetCoCNear.texture.format = RGBFormat;

		this.uniforms.get("cocNearBuffer").value = this.renderTargetCoCNear.texture;

		/**
		 * A render target for the positive circle of confusion values.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetCoCFar = this.renderTargetCoCNear.clone();
		this.renderTargetCoCFar.texture.name = "DoF.CoC.Far";

		this.uniforms.get("cocFarBuffer").value = this.renderTargetCoCFar.texture;

		/**
		 * Copies the CoC texture to separate near and far values.
		 *
		 * This pass is necessary because MRT is currently not supported.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.copyPass = new ShaderPass(new CopyMaterial());

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass({ width, height, kernelSize: KernelSize.MEDIUM });
		this.blurPass.resolution.resizable = this;

		/**
		 * A circle of confusion pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.circleOfConfusionPass = new ShaderPass(new CircleOfConfusionMaterial(camera));
		const cocMaterial = this.circleOfConfusionMaterial;
		cocMaterial.uniforms.focusDistance.value = focusDistance;
		cocMaterial.uniforms.focalLength.value = focalLength;

		/**
		 * A bokeh blur pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehPass1 = new ShaderPass(new BokehMaterial());
		this.bokehPass1.getFullscreenMaterial().defines.PASS = "1";

		/**
		 * A bokeh blur pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehPass2 = new ShaderPass(new BokehMaterial());
		this.bokehPass2.getFullscreenMaterial().defines.PASS = "2";

	}

	/**
	 * The circle of confusion material.
	 *
	 * @type {LuminanceMaterial}
	 */

	get circleOfConfusionMaterial() {

		return this.circleOfConfusionPass.getFullscreenMaterial();

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
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.circleOfConfusionMaterial;
		material.uniforms.depthBuffer.value = depthTexture;
		material.depthPacking = depthPacking;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const renderTarget = this.renderTarget;
		const renderTargetNear = this.renderTargetNear;
		const renderTargetFar = this.renderTargetFar;
		const renderTargetCoCNear = this.renderTargetCoCNear;
		const renderTargetCoCFar = this.renderTargetCoCFar;

		const bokehPass1 = this.bokehPass1;
		const bokehPass2 = this.bokehPass2;
		const bokehMaterial1 = this.bokehPass1.getFullscreenMaterial();
		const bokehMaterial2 = this.bokehPass2.getFullscreenMaterial();

		this.circleOfConfusionPass.render(renderer, null, renderTargetCoCNear);
		this.copyPass.render(renderer, renderTargetCoCNear, renderTargetCoCFar);
		this.blurPass.render(renderer, renderTargetCoCFar, renderTargetCoCFar);

		// Blur the near scene.
		bokehMaterial1.uniforms.cocBuffer.value = renderTargetCoCNear;
		bokehMaterial2.uniforms.cocBuffer.value = renderTargetCoCNear;
		bokehMaterial1.uniforms.cocMask.value.set(1.0, 0.0);
		bokehMaterial2.uniforms.cocMask.value.set(1.0, 0.0);

		bokehPass1.render(renderer, inputBuffer, renderTarget);
		bokehPass2.render(renderer, renderTarget, renderTargetNear);

		// Blur the far scene.
		bokehMaterial1.uniforms.cocBuffer.value = renderTargetCoCFar;
		bokehMaterial2.uniforms.cocBuffer.value = renderTargetCoCFar;
		bokehMaterial1.uniforms.cocMask.value.set(0.0, 1.0);
		bokehMaterial2.uniforms.cocMask.value.set(0.0, 1.0);

		bokehPass1.render(renderer, inputBuffer, renderTarget);
		bokehPass2.render(renderer, renderTarget, renderTargetFar);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		this.blurPass.setSize(width, height);

		width = resolution.width;
		height = resolution.height;

		this.renderTarget.setSize(width, height);
		this.renderTargetNear.setSize(width, height);
		this.renderTargetFar.setSize(width, height);
		this.renderTargetCoCNear.setSize(width, height);
		this.renderTargetCoCFar.setSize(width, height);

		this.bokehPass1.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
		this.bokehPass2.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);

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
		this.circleOfConfusionPass.initialize(renderer, alpha, frameBufferType);
		this.copyPass.initialize(renderer, alpha, frameBufferType);
		this.bokehPass1.initialize(renderer, alpha, frameBufferType);
		this.bokehPass2.initialize(renderer, alpha, frameBufferType);

		if(!alpha) {

			this.renderTargetNear.texture.format = RGBFormat;
			this.renderTargetFar.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;
			this.renderTargetNear.texture.type = frameBufferType;
			this.renderTargetFar.texture.type = frameBufferType;

		}

	}

}
