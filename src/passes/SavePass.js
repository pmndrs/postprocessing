import { LinearFilter, RGBFormat, WebGLRenderTarget } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A pass that renders the result from a previous pass to another render target.
 */

export class SavePass extends Pass {

	/**
	 * Constructs a new save pass.
	 *
	 * @param {WebGLRenderTarget} [renderTarget] - The render target to use for saving the input buffer.
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

		this.renderTarget = (renderTarget !== undefined) ? renderTarget : new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "Save.Target";
		this.renderTarget.texture.generateMipmaps = false;

		/**
		 * Indicates whether the render target should be resized when the size of
		 * the composer's frame buffer changes.
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

		this.getFullscreenMaterial().uniforms.tDiffuse.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderTarget);

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

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		if(!alpha) {

			this.renderTarget.texture.format = RGBFormat;

		}

	}

}
