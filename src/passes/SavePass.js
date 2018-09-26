import { LinearFilter, WebGLRenderTarget } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A pass that renders the result from a previous pass to another render target.
 */

export class SavePass extends Pass {

	/**
	 * Constructs a new save pass.
	 *
	 * @param {WebGLRenderTarget} [renderTarget] - A render target.
	 * @param {Boolean} [resize=true] - Whether the render target should adjust to the size of the input buffer.
	 */

	constructor(renderTarget, resize = true) {

		super("SavePass");

		this.setFullscreenMaterial(new CopyMaterial());

		this.needsSwap = false;

		/**
		 * The render target.
		 *
		 * @type {WebGLRenderTarget}
		 */

		this.renderTarget = renderTarget;

		if(renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "SavePass.Target";
			this.renderTarget.texture.generateMipmaps = false;

		}

		/**
		 * Indicates whether the render target should be resized automatically.
		 *
		 * @type {Boolean}
		 */

		this.resize = resize;

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

		this.getFullscreenMaterial().uniforms.inputBuffer.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : this.renderTarget);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		if(this.resize) {

			width = Math.max(1, width);
			height = Math.max(1, height);

			this.renderTarget.setSize(width, height);

		}

	}

}
