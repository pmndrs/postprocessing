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

		super("DotScreenPass");

		this.material = new DotScreenMaterial(options);

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		this.material.uniforms.tDiffuse.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		width = Math.max(1, width);
		height = Math.max(1, height);

		this.material.uniforms.offsetRepeat.value.z = width;
		this.material.uniforms.offsetRepeat.value.w = height;

	}

}
