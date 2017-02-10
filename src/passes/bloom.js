import { LinearFilter, RGBFormat, WebGLRenderTarget } from "three";
import { CombineMaterial, LuminosityMaterial, ConvolutionMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A bloom pass.
 *
 * This pass renders a scene with superimposed blur by utilising the fast Kawase
 * convolution approach.
 *
 * @class BloomPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
 * @param {Number} [options.blurriness=1.0] - The scale of the blur.
 * @param {Number} [options.intensity=1.0] - The strength of the bloom effect.
 * @param {Number} [options.distinction=1.0] - The luminance distinction factor. Raise this value to bring out the brighter elements in the scene.
 * @param {Number} [options.screenMode=true] - Whether the screen blend mode should be used for combining the bloom texture with the scene colors.
 */

export class BloomPass extends Pass {

	constructor(options = {}) {

		super();

		/**
		 * A render target.
		 *
		 * @property renderTargetX
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetX = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			stencilBuffer: false,
			depthBuffer: false
		});

		/**
		 * A second render target.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();

		/**
		 * The resolution scale.
		 *
		 * You need to call the setSize method of the EffectComposer after changing
		 * this value.
		 *
		 * @property resolutionScale
		 * @type Number
		 * @default 0.5
		 */

		this.resolutionScale = (options.resolutionScale !== undefined) ? options.resolutionScale : 0.5;

		/**
		 * Combine shader material.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial((options.screenMode !== undefined) ? options.screenMode : true);

		this.intensity = options.intensity;

		/**
		 * Luminance shader material.
		 *
		 * @property luminosityMaterial
		 * @type LuminosityMaterial
		 * @private
		 */

		this.luminosityMaterial = new LuminosityMaterial(true);

		this.distinction = options.distinction;

		/**
		 * Convolution shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		this.blurriness = options.blurriness;

	}

	/**
	 * The strength of the preliminary blur phase.
	 *
	 * @property blurriness
	 * @type Number
	 * @default 1.0
	 */

	get blurriness() { return this.convolutionMaterial.scale; }

	set blurriness(x) {

		if(typeof x === "number") {

			this.convolutionMaterial.scale = x;

		}

	}

	/**
	 * The overall intensity of the effect.
	 *
	 * @property intensity
	 * @type Number
	 * @default 1.0
	 */

	get intensity() { return this.combineMaterial.uniforms.opacity2.value; }

	set intensity(x) {

		if(typeof x === "number") {

			this.combineMaterial.uniforms.opacity2.value = x;

		}

	}

	/**
	 * The luminance distinction factor.
	 *
	 * @property distinction
	 * @type Number
	 * @default 1.0
	 */

	get distinction() { return this.luminosityMaterial.uniforms.distinction.value; }

	set distinction(x) {

		if(typeof x === "number") {

			this.luminosityMaterial.uniforms.distinction.value = x;

		}

	}

	/**
	 * Renders the effect.
	 *
	 * Applies a luminance filter and convolution blur to the read buffer and
	 * renders the result into a seperate render target. The result is additively
	 * blended with the read buffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const quad = this.quad;
		const scene = this.scene;
		const camera = this.camera;

		const luminosityMaterial = this.luminosityMaterial;
		const convolutionMaterial = this.convolutionMaterial;
		const combineMaterial = this.combineMaterial;

		const renderTargetX = this.renderTargetX;
		const renderTargetY = this.renderTargetY;

		// Luminance filter.
		quad.material = luminosityMaterial;
		luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(scene, camera, renderTargetX);

		// Convolution phase.
		quad.material = convolutionMaterial;

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetY.texture;
		renderer.render(scene, camera, renderTargetX);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetY.texture;
		renderer.render(scene, camera, renderTargetX);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		// Render the original scene with superimposed blur.
		quad.material = combineMaterial;
		combineMaterial.uniforms.texture1.value = readBuffer.texture;
		combineMaterial.uniforms.texture2.value = renderTargetY.texture;

		renderer.render(scene, camera, this.renderToScreen ? null : writeBuffer, this.clear);

	}

	/**
	 * Adjusts the format of the render targets.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		if(!alpha) {

			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		width = Math.max(1, Math.floor(width * this.resolutionScale));
		height = Math.max(1, Math.floor(height * this.resolutionScale));

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
