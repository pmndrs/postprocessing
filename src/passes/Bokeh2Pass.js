import { Bokeh2Material } from "../materials";
import { Pass } from "./Pass.js";

/**
 * An advanced Depth of Field (DoF) pass.
 *
 * Yields more realistic results but is also more demanding.
 *
 * This pass requires a {@link EffectComposer#depthTexture}.
 */

export class Bokeh2Pass extends Pass {

	/**
	 * Constructs a new bokeh2 pass.
	 *
	 * @param {PerspectiveCamera} camera - The main camera. Used to obtain the focal length and the near and far plane settings.
	 * @param {Object} [options] - Additional parameters.
	 * @param {Number} [options.rings=3] - The amount of blur rings.
	 * @param {Number} [options.samples=4] - The amount of samples per ring.
	 * @param {Boolean} [options.showFocus=false] - Whether the focus point should be highlighted.
	 * @param {Boolean} [options.manualDoF=false] - Enables manual depth of field blur.
	 * @param {Boolean} [options.vignette=false] - Enables a vignette effect.
	 * @param {Boolean} [options.pentagon=false] - Enable to use a pentagonal shape to scale gathered texels.
	 * @param {Boolean} [options.shaderFocus=true] - Disable if you compute your own focalDepth (in metres!).
	 * @param {Boolean} [options.noise=true] - Disable if you don't want noise patterns for dithering.
	 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
	 * @param {Number} [options.luminanceThreshold=0.5] - A luminance threshold.
	 * @param {Number} [options.luminanceGain=2.0] - A luminance gain factor.
	 * @param {Number} [options.bias=0.5] - A blur bias.
	 * @param {Number} [options.fringe=0.7] - A blur offset.
	 * @param {Number} [options.ditherStrength=0.0001] - The dither strength.
	 */

	constructor(camera, options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "Bokeh2Pass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A bokeh shader material.
		 *
		 * @type {BokehMaterial}
		 * @private
		 */

		this.bokehMaterial = new Bokeh2Material(camera, options);

		this.quad.material = this.bokehMaterial;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.bokehMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		this.bokehMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.bokehMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
