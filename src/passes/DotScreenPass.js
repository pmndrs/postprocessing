import { DotScreenMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A dot screen pass.
 */

export class DotScreenPass extends Pass {

	/**
	 * Constructs a new dot screen pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.average=false] - Whether the shader should output a colour average (black and white).
	 * @param {Number} [options.angle=1.57] - The angle of the pattern.
	 * @param {Number} [options.scale=1.0] - The scale of the overall effect.
	 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
	 */

	constructor(options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "DotScreenPass";

		/**
		 * A dot screen shader material.
		 *
		 * @type {DotScreenMaterial}
		 * @private
		 */

		this.material = new DotScreenMaterial(options);

		this.quad.material = this.material;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} heght - The height.
	 */

	setSize(width, height) {

		width = Math.max(1, width);
		height = Math.max(1, height);

		this.material.uniforms.offsetRepeat.value.z = width;
		this.material.uniforms.offsetRepeat.value.w = height;

	}

}
