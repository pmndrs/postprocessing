import { DotScreenMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A render pass.
 *
 * @class DotScreenPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Number} [options.angle=1.57] - The angle of the pattern.
 * @param {Number} [options.scale=1.0] - The scale of the overall effect.
 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
 * @param {Boolean} [options.average=false] - Whether the shader should output a colour average (black and white).
 */

export class DotScreenPass extends Pass {

	constructor(options) {

		super();

		this.needsSwap = true;

		if(options === undefined) { options = {}; }

		/**
		 * Dot screen shader material description.
		 *
		 * @property material
		 * @type DotScreenMaterial
		 * @private
		 */

		this.material = new DotScreenMaterial(options.average);

		if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
		if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }
		if(options.intensity !== undefined) { this.material.uniforms.intensity.value = options.intensity; }

		this.quad.material = this.material;

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

		this.material.uniforms.tDiffuse.value = readBuffer.texture;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Adjusts the size of the effect.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	initialise(renderer) {

		let size = renderer.getSize();
		this.setSize(size.width, size.height);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} heght - The height.
	 */

	setSize(width, height) {

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.material.uniforms.offsetRepeat.value.z = width;
		this.material.uniforms.offsetRepeat.value.w = height;

	}

}
