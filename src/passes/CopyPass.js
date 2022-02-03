import { LinearFilter, UnsignedByteType, WebGLRenderTarget } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./Pass";

/**
 * A pass that copies the contents of an input buffer to another render target.
 */

export class CopyPass extends Pass {

	/**
	 * Constructs a new save pass.
	 *
	 * @param {WebGLRenderTarget} [renderTarget] - A render target.
	 * @param {Boolean} [autoResize=true] - Whether the render target size should be updated automatically.
	 */

	constructor(renderTarget, autoResize = true) {

		super("CopyPass");

		this.setFullscreenMaterial(new CopyMaterial());
		this.needsSwap = false;

		/**
		 * The render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = renderTarget;

		if(renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "CopyPass.Target";

		}

		/**
		 * Indicates whether the render target should be resized automatically.
		 *
		 * @type {Boolean}
		 * @deprecated Use setAutoResize() instead.
		 */

		this.resize = autoResize;

	}

	/**
	 * The saved texture.
	 *
	 * @type {Texture}
	 * @deprecated Use getTexture() instead.
	 */

	get texture() {

		return this.getTexture();

	}

	/**
	 * Returns the texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * Enables or disables auto resizing of the render target.
	 *
	 * @param {Boolean} value - Whether the render target size should be updated automatically.
	 */

	setAutoResize(value) {

		this.resize = value;

	}

	/**
	 * Saves the input buffer.
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

		if(this.resize) {

			const w = Math.max(width, 1);
			const h = Math.max(height, 1);

			this.renderTarget.setSize(w, h);

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - A renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

			if(frameBufferType !== UnsignedByteType) {

				const material = this.getFullscreenMaterial();
				material.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			}

		}

	}

}
