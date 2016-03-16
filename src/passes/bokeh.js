import { BokehMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * Depth of Field pass using a bokeh shader.
 *
 * @class BokehPass
 * @constructor
 * @extends Pass
 * @param {WebGLRenderTarget} depthTexture - A render texture that contains the depth of the scene.
 * @param {Object} [options] - Additional parameters.
 * @param {Number} [options.focus=1.0] - Focus distance.
 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
 */

export class BokehPass extends Pass {

	constructor(depthTexture, options) {

		if(options === undefined) { options = {}; }

		super();

		/**
		 * Bokeh shader material.
		 *
		 * @property bokehMaterial
		 * @type BokehMaterial
		 * @private
		 */

		this.bokehMaterial = new BokehMaterial(options);

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

		this.bokehMaterial.uniforms.tDiffuse.value = readBuffer;

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

		this.bokehMaterial.uniforms.aspect.value = width / height;

	}

}
