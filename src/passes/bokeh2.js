import { Bokeh2Material } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * Depth of Field pass version 2.
 *
 * This pass yields more realistic results but is also more demanding.
 *
 * @class Bokeh2Pass
 * @constructor
 * @extends Pass
 * @param {Texture} depthTexture - A render texture that contains the depth of the scene.
 * @param {PerspectiveCamera} camera - The main camera. Used to adjust near and far plane and focal length settings.
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

	constructor(depthTexture, camera, options) {

		super();

		if(options === undefined) { options = {}; }

		/**
		 * Bokeh shader material.
		 *
		 * @property bokehMaterial
		 * @type BokehMaterial
		 * @private
		 */

		this.bokehMaterial = new Bokeh2Material(camera, options);

		this.bokehMaterial.uniforms.tDepth.value = (depthTexture !== undefined) ? depthTexture : null;

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

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Adjusts the format and size of the render targets.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		let size = renderer.getSize();
		this.setSize(size.width, size.height);

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

}
