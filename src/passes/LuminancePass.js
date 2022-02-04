import { LinearFilter, UnsignedByteType, WebGLRenderTarget } from "three";
import { LuminanceMaterial } from "../materials";
import { Resolution } from "../core/Resolution";
import { Pass } from "./Pass";

/**
 * A pass that renders luminance.
 */

export class LuminancePass extends Pass {

	/**
	 * Constructs a new luminance pass.
	 *
	 * @param {Object} [options] - The options. See {@link LuminanceMaterial} for additional options.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The render height.
	 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	 */

	constructor({
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		renderTarget,
		luminanceRange,
		colorOutput
	} = {}) {

		super("LuminancePass");

		this.setFullscreenMaterial(new LuminanceMaterial(colorOutput, luminanceRange));
		this.needsSwap = false;

		/**
		 * The luminance render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = renderTarget;

		if(this.renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "LuminancePass.Target";
			this.renderTarget.texture.generateMipmaps = false;

		}

		/**
		 * The resolution.
		 *
		 * @type {Resolution}
		 * @deprecated Use getResolution() instead.
		 */

		this.resolution = new Resolution(this, width, height, resolutionScale);
		this.resolution.addEventListener("change", (e) => this.setSize(
			this.resolution.getBaseWidth(),
			this.resolution.getBaseHeight()
		));

	}

	/**
	 * The luminance texture.
	 *
	 * @type {Texture}
	 * @deprecated Use getTexture() instead.
	 */

	get texture() {

		return this.getTexture();

	}

	/**
	 * Returns the luminance texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * Renders the luminance.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const material = this.getFullscreenMaterial();
		material.uniforms.inputBuffer.value = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.getWidth(), resolution.getHeight());

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

			const material = this.getFullscreenMaterial();
			material.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

		}

	}

}
