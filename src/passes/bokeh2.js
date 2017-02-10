import { Bokeh2Material } from "../materials";
import { Pass } from "./pass.js";

/**
 * An advanced Depth of Field (DoF) pass.
 *
 * Yields more realistic results but is also more demanding.
 *
 * This pass requires a depth texture. See
 * {{#crossLink "EffectComposer/depthTexture:attribute"}}{{/crossLink}}.
 *
 * @class Bokeh2Pass
 * @submodule passes
 * @extends Pass
 * @constructor
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
 */

export class Bokeh2Pass extends Pass {

	constructor(camera, options = {}) {

		super();

		/**
		 * Bokeh shader material.
		 *
		 * @property bokehMaterial
		 * @type BokehMaterial
		 * @private
		 */

		this.bokehMaterial = new Bokeh2Material(camera, options);

		this.quad.material = this.bokehMaterial;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.bokehMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		this.bokehMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer, this.clear);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.bokehMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

	/**
	 * Checks if the renderer uses logarithmic depth.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	initialise(renderer) {

		if(renderer.capabilities.logarithmicDepthBuffer) {

			this.bokehMaterial.defines.USE_LOGDEPTH = "1";

		}

	}

}
