import { UnsignedByteType } from "three";
import { Pass } from "./Pass.js";

/**
 * A shader pass.
 *
 * Renders any shader material as a fullscreen effect. If you want to create multiple chained effects, please use
 * {@link EffectPass} instead.
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

		this.fullscreenMaterial = material;

		/**
		 * The name of the input buffer uniform.
		 *
		 * Most fullscreen materials modify texels from an input texture. This pass automatically assigns the main input
		 * buffer to the uniform identified by the input name.
		 *
		 * @type {String}
		 */

		this.input = input;

	}

	/**
	 * Sets the name of the input buffer uniform.
	 *
	 * @param {String} input - The name of the input buffer uniform.
	 * @deprecated Use input instead.
	 */

	setInput(input) {

		this.input = input;

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

		const uniforms = this.fullscreenMaterial.uniforms;

		if(inputBuffer !== null && uniforms !== undefined && uniforms[this.input] !== undefined) {

			uniforms[this.input].value = inputBuffer.texture;

		}

		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(this.scene, this.camera);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - A renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(frameBufferType !== undefined && frameBufferType !== UnsignedByteType) {

			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

		}

	}

}
