import { Pass } from "./Pass.js";

/**
 * A shader pass.
 *
 * Used to render any shader material as a 2D filter.
 */

export class ShaderPass extends Pass {

	/**
	 * Constructs a new shader pass.
	 *
	 * @param {ShaderMaterial} material - The shader material to use.
	 * @param {String} [textureID="tDiffuse"] - The texture uniform identifier.
	 */

	constructor(material, textureID = "tDiffuse") {

		super("ShaderPass");

		this.setFullscreenMaterial(material);

		/**
		 * The name of the color sampler uniform of the given material.
		 *
		 * @type {String}
		 */

		this.textureID = textureID;

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

		const uniforms = this.getFullscreenMaterial().uniforms;

		if(uniforms[this.textureID] !== undefined) {

			uniforms[this.textureID].value = inputBuffer.texture;

		}

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

}
