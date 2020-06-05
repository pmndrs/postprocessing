import { LinearFilter, RGBFormat, Uniform, UnsignedByteType, WebGLRenderTarget } from "three";
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
				["nearColorBuffer", new Uniform(null)],
				["farColorBuffer", new Uniform(null)],
				["nearCoCBuffer", new Uniform(null)],
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

		this.uniforms.get("nearColorBuffer").value = this.renderTargetNear.texture;

		/**
		 * A render target for the blurred background colors.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetFar = this.renderTarget.clone();
		this.renderTargetFar.texture.name = "DoF.Bokeh.Far";

		this.uniforms.get("farColorBuffer").value = this.renderTargetFar.texture;

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

		this.renderTargetCoCBlurred = this.renderTargetCoC.clone();
		this.renderTargetCoCBlurred.texture.name = "DoF.CoC.Blurred";

		this.uniforms.get("nearCoCBuffer").value = this.renderTargetCoCBlurred.texture;

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
		maskMaterial.maskFunction = MaskFunction.MULTIPLY_RGB_SET_ALPHA;
		maskMaterial.colorChannel = ColorChannel.GREEN;

		/**
		 * A bokeh blur pass for the foreground colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehNearBasePass = new ShaderPass(new BokehMaterial(false, true));

		/**
		 * A bokeh fill pass for the foreground colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehNearFillPass = new ShaderPass(new BokehMaterial(true, true));

		/**
		 * A bokeh blur pass for the background colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehFarBasePass = new ShaderPass(new BokehMaterial(false, false));

		/**
		 * A bokeh fill pass for the background colors.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.bokehFarFillPass = new ShaderPass(new BokehMaterial(true, false));

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

		return this.uniforms.get("scale").value;

	}

	/**
	 * Sets the bokeh scale.
	 *
	 * @type {Number}
	 */

	set bokehScale(value) {

		const passes = [
			this.bokehNearBasePass,
			this.bokehNearFillPass,
			this.bokehFarBasePass,
			this.bokehFarFillPass
		];

		passes.map((p) => p.getFullscreenMaterial().uniforms.scale).forEach((u) => {

			u.value = value;

		});

		this.maskPass.getFullscreenMaterial().uniforms.strength.value = value;
		this.uniforms.get("scale").value = value;

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
		const renderTargetCoC = this.renderTargetCoC;
		const renderTargetCoCBlurred = this.renderTargetCoCBlurred;
		const renderTargetMasked = this.renderTargetMasked;

		const bokehFarBasePass = this.bokehFarBasePass;
		const bokehFarFillPass = this.bokehFarFillPass;
		const farBaseUniforms = bokehFarBasePass.getFullscreenMaterial().uniforms;
		const farFillUniforms = bokehFarFillPass.getFullscreenMaterial().uniforms;

		const bokehNearBasePass = this.bokehNearBasePass;
		const bokehNearFillPass = this.bokehNearFillPass;
		const nearBaseUniforms = bokehNearBasePass.getFullscreenMaterial().uniforms;
		const nearFillUniforms = bokehNearFillPass.getFullscreenMaterial().uniforms;

		// Auto focus.
		if(this.target !== null) {

			const distance = this.calculateFocusDistance(this.target);
			this.circleOfConfusionMaterial.uniforms.focusDistance.value = distance;

		}

		// Render the CoC and create a blurred version for soft near field blending.
		this.cocPass.render(renderer, null, renderTargetCoC);
		this.blurPass.render(renderer, renderTargetCoC, renderTargetCoCBlurred);

		// Prevent sharp colors from bleeding onto the background.
		this.maskPass.render(renderer, inputBuffer, renderTargetMasked);

		// Use the sharp CoC buffer and render the background bokeh.
		farBaseUniforms.cocBuffer.value = farFillUniforms.cocBuffer.value = renderTargetCoC.texture;
		bokehFarBasePass.render(renderer, renderTargetMasked, renderTarget);
		bokehFarFillPass.render(renderer, renderTarget, this.renderTargetFar);

		// Use the blurred CoC buffer and render the foreground bokeh.
		nearBaseUniforms.cocBuffer.value = nearFillUniforms.cocBuffer.value = renderTargetCoCBlurred.texture;
		bokehNearBasePass.render(renderer, inputBuffer, renderTarget);
		bokehNearFillPass.render(renderer, renderTarget, this.renderTargetNear);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;

		let resizables = [
			this.cocPass,
			this.blurPass,
			this.maskPass,
			this.bokehNearBasePass,
			this.bokehNearFillPass,
			this.bokehFarBasePass,
			this.bokehFarFillPass
		];

		// These buffers require full resolution to prevent bleeding artifacts.
		resizables.push(this.renderTargetCoC, this.renderTargetMasked);
		resizables.forEach((r) => r.setSize(width, height));

		const w = resolution.width;
		const h = resolution.height;

		resizables = [
			this.renderTarget,
			this.renderTargetNear,
			this.renderTargetFar,
			this.renderTargetCoCBlurred
		];

		resizables.forEach((r) => r.setSize(w, h));

		// The bokeh blur passes operate on the low resolution buffers.
		const passes = [
			this.bokehNearBasePass,
			this.bokehNearFillPass,
			this.bokehFarBasePass,
			this.bokehFarFillPass
		];

		passes.forEach((p) => p.getFullscreenMaterial().setTexelSize(1.0 / w, 1.0 / h));

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		const initializables = [
			this.cocPass,
			this.maskPass,
			this.bokehNearBasePass,
			this.bokehNearFillPass,
			this.bokehFarBasePass,
			this.bokehFarFillPass
		];

		initializables.forEach((i) => i.initialize(renderer, alpha, frameBufferType));

		// The blur pass operates on the CoC buffer.
		this.blurPass.initialize(renderer, alpha, UnsignedByteType);

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTargetNear.texture.type = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;
			this.renderTargetNear.texture.type = frameBufferType;
			this.renderTargetFar.texture.type = frameBufferType;
			this.renderTargetMasked.texture.type = frameBufferType;

		}

	}

}
