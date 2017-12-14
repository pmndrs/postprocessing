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
	 * @param {WebGLRenderTarget} [renderTarget] - The render target to use for saving the read buffer.
	 * @param {Boolean} [resize=true] - Whether the render target should adjust to the size of the read/write buffer.
	 */

	constructor(renderTarget, resize = true) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "SavePass";

		/**
		 * Copy shader material.
		 *
		 * @type {CopyMaterial}
		 * @private
		 */

		this.material = new CopyMaterial();

		this.quad.material = this.material;

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
		 * the composer's read/write buffer changes.
		 *
		 * @type {Boolean}
		 */

		this.resize = resize;

	}

	/**
	 * Saves the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderTarget);

	}

	/**
	 * Adjusts the format of the render target.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		if(!alpha) {

			this.renderTarget.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
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
