import { Pass } from "./Pass.js";

/**
 * A shader pass.
 *
 * Renders any shader material as a fullscreen effect.
 *
 * This pass should not be used to create multiple chained effects. For a more
 * efficient solution, please refer to the {@link EffectPass}.
 */

export class ShaderPass extends Pass {

	/**
	 * Constructs a new shader pass.
	 *
	 * @param {ShaderMaterial} material - A shader material.
	 * @param {String} [input="inputBuffer"] - The name of the input buffer uniform.
	 */

	constructor(material, input = "inputBuffer") {

		super("ShaderPass");

		this.setFullscreenMaterial(material);

		/**
		 * The input buffer uniform.
		 *
		 * @type {String}
		 * @private
		 */

		this.uniform = null;
		this.setInput(input);

	}

	/**
	 * Sets the name of the input buffer uniform.
	 *
	 * Most fullscreen materials modify texels from an input texture. This pass
	 * automatically assigns the main input buffer to the uniform identified by
	 * the given name.
	 *
	 * @param {String} input - The name of the input buffer uniform.
	 */

	setInput(input) {

		const material = this.getFullscreenMaterial();

		this.uniform = null;

		if(material !== null) {

			const uniforms = material.uniforms;

			if(uniforms !== undefined && uniforms[input] !== undefined) {

				this.uniform = uniforms[input];

			}

		}

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		if(this.uniform !== null) {

			this.uniform.value = inputBuffer.texture;

		}

		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(this.scene, this.camera);

	}

}
