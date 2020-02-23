import { LinearFilter, RGBFormat, Uniform, WebGLRenderTarget } from "three";
import { ColorChannel, Resizer } from "../core";
import { BokehMaterial, CircleOfConfusionMaterial, KernelSize, MaskFunction, MaskMaterial } from "../materials";
import { BlurPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/depth-of-field/shader.frag";

/**
 * A depth of field effect.
 *
 * Based on a graphics study by Adrian Courrèges and an article by Steve Avery:
 *  https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/
 *  https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/
 */

export class DepthOfFieldEffect extends Effect {

	/**
	 * Constructs a new depth of field effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.focusDistance=0.0] - The normalized focus distance. Range is [0.0, 1.0].
	 * @param {Number} [options.focalLength=0.05] - The focal length. Range is [0.0, 1.0].
	 * @param {Number} [options.bokehScale=1.0] - The scale of the bokeh blur.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 */

	constructor(camera, {
		blendFunction = BlendFunction.NORMAL,
		focusDistance = 0.0,
		focalLength = 0.1,
		bokehScale = 1.0,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE
	} = {}) {

		super("DepthOfFieldEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.DEPTH,

			uniforms: new Map([
				["nearBuffer", new Uniform(null)],
				["farBuffer", new Uniform(null)],
				["cocBuffer", new Uniform(null)],
				["scale", new Uniform(1.0)]
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
		 * A render target for intermediate results.
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
		 * A render target for masked background colors (premultiplied with CoC).
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMasked = this.renderTarget.clone();
		this.renderTargetMasked.texture.name = "DoF.Masked.Far";

		/**
		 * A render target for the blurred foreground colors.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetNear = this.renderTarget.clone();
		this.renderTargetNear.texture.name = "DoF.Bokeh.Near";

		this.uniforms.get("nearBuffer").value = this.renderTargetNear.texture;

		/**
		 * A render target for the blurred background colors.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetFar = this.renderTarget.clone();
		this.renderTargetFar.texture.name = "DoF.Bokeh.Far";

		this.uniforms.get("farBuffer").value = this.renderTargetFar.texture;

		/**
		 * A render target for the circle of confusion.
		 *
		 * - Negative values are stored in the `RED` channel (foreground).
		 * - Positive values are stored in the `GREEN` channel (background).
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetCoC = this.renderTarget.clone();
		this.renderTargetCoC.texture.format = RGBFormat;
		this.renderTargetCoC.texture.name = "DoF.CoC";

		/**
		 * A render target that stores a blurred copy of the circle of confusion.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetCoCNear = this.renderTargetCoC.clone();
		this.renderTargetCoCNear.texture.name = "DoF.CoC.Near";

		this.uniforms.get("cocBuffer").value = this.renderTargetCoCNear.texture;

		/**
		 * A circle of confusion pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.cocPass = new ShaderPass(new CircleOfConfusionMaterial(camera));
		const cocMaterial = this.circleOfConfusionMaterial;
		cocMaterial.uniforms.focusDistance.value = focusDistance;
		cocMaterial.uniforms.focalLength.value = focalLength;

		/**
		 * This pass blurs the foreground CoC buffer to soften edges.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ width, height, kernelSize: KernelSize.MEDIUM });
		this.blurPass.resolution.resizable = this;

		/**
		 * A mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.maskPass = new ShaderPass(new MaskMaterial(this.renderTargetCoC.texture));
		const maskMaterial = this.maskPass.getFullscreenMaterial();
		maskMaterial.colorChannel = ColorChannel.GREEN;
		maskMaterial.maskFunction = MaskFunction.MULTIPLY;

		/**
		 * A bokeh blur pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehBasePass = new ShaderPass(new BokehMaterial(false));

		/**
		 * A bokeh fill pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehFillPass = new ShaderPass(new BokehMaterial(true));

		this.bokehScale = bokehScale;

		/**
		 * A target position that should be kept in focus.
		 *
		 * Set this to `null` to disable auto focus.
		 *
		 * @type {Vector3}
		 */

		this.target = null;

	}

	/**
	 * The circle of confusion material.
	 *
	 * @type {CircleOfConfusionMaterial}
	 */

	get circleOfConfusionMaterial() {

		return this.cocPass.getFullscreenMaterial();

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
	 * The current bokeh scale.
	 *
	 * @type {Number}
	 */

	get bokehScale() {

		return this.bokehBasePass.getFullscreenMaterial().uniforms.scale.value;

	}

	/**
	 * Sets the bokeh scale.
	 *
	 * @type {Number}
	 */

	set bokehScale(value) {

		this.uniforms.get("scale").value = value;
		this.bokehBasePass.getFullscreenMaterial().uniforms.scale.value = value;
		this.bokehFillPass.getFullscreenMaterial().uniforms.scale.value = value;

	}

	/**
	 * Calculates the focus distance from the camera to the given position.
	 *
	 * @param {Vector3} target - The target.
	 * @return {Number} The normalized focus distance.
	 */

	calculateFocusDistance(target) {

		const camera = this.camera;
		const viewDistance = camera.far - camera.near;
		const distance = camera.position.distanceTo(target);

		return Math.min(Math.max((distance / viewDistance), 0.0), 1.0);

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
		const renderTargetCoC = this.renderTargetCoC;
		const renderTargetCoCNear = this.renderTargetCoCNear;
		const renderTargetMasked = this.renderTargetMasked;

		const bokehBasePass = this.bokehBasePass;
		const bokehFillPass = this.bokehFillPass;
		const uniformsBase = bokehBasePass.getFullscreenMaterial().uniforms;
		const uniformsFill = bokehFillPass.getFullscreenMaterial().uniforms;

		// Auto focus.
		if(this.target !== null) {

			const focusDistance = this.calculateFocusDistance(this.target);
			this.circleOfConfusionMaterial.uniforms.focusDistance.value = focusDistance;

		}

		// Render the CoC and create a blurred version for soft near field blending.
		this.cocPass.render(renderer, null, renderTargetCoC);
		this.blurPass.render(renderer, renderTargetCoC, renderTargetCoCNear);

		// Use the blurred CoC buffer and ignore far CoC values.
		uniformsBase.cocBuffer.value = renderTargetCoCNear.texture;
		uniformsFill.cocBuffer.value = renderTargetCoCNear.texture;
		uniformsBase.cocMask.value.copy(uniformsFill.cocMask.value.set(1.0, 0.0));

		// Render the foreground bokeh.
		bokehBasePass.render(renderer, inputBuffer, renderTarget);
		bokehFillPass.render(renderer, renderTarget, renderTargetNear);

		// Use the sharp CoC buffer and ignore near CoC values.
		uniformsBase.cocBuffer.value = renderTargetCoC.texture;
		uniformsFill.cocBuffer.value = renderTargetCoC.texture;
		uniformsBase.cocMask.value.copy(uniformsFill.cocMask.value.set(0.0, 1.0));

		// Prevent sharp colors from bleeding onto the background.
		this.maskPass.render(renderer, inputBuffer, renderTargetMasked);

		// Render the background bokeh.
		bokehBasePass.render(renderer, renderTargetMasked, renderTarget);
		bokehFillPass.render(renderer, renderTarget, renderTargetFar);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;

		this.cocPass.setSize(width, height);
		this.blurPass.setSize(width, height);
		this.maskPass.setSize(width, height);

		this.bokehBasePass.setSize(width, height);
		this.bokehFillPass.setSize(width, height);

		// These buffers require full resolution to prevent bleeding artifacts.
		this.renderTargetCoC.setSize(width, height);
		this.renderTargetMasked.setSize(width, height);

		width = resolution.width;
		height = resolution.height;

		this.renderTarget.setSize(width, height);
		this.renderTargetNear.setSize(width, height);
		this.renderTargetFar.setSize(width, height);
		this.renderTargetCoCNear.setSize(width, height);

		// The blur passes operate on the low resolution buffers.
		this.bokehBasePass.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);
		this.bokehFillPass.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.cocPass.initialize(renderer, alpha, frameBufferType);
		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.maskPass.initialize(renderer, alpha, frameBufferType);

		this.bokehBasePass.initialize(renderer, alpha, frameBufferType);
		this.bokehFillPass.initialize(renderer, alpha, frameBufferType);

		if(!alpha) {

			this.renderTargetNear.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;
			this.renderTargetNear.texture.type = frameBufferType;
			this.renderTargetFar.texture.type = frameBufferType;
			this.renderTargetMasked.texture.type = frameBufferType;

		}

	}

}
