import { LinearFilter, RGBFormat, WebGLRenderTarget } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A pass that renders the result from a previous pass to another render target.
 *
 * @class SavePass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {WebGLRenderTarget} [renderTarget] - The render target to use for saving the read buffer.
 * @param {Boolean} [resize=true] - Whether the render target should adjust to the size of the read/write buffer.
 */

export class SavePass extends Pass {

	constructor(renderTarget, resize = true) {

		super();

		/**
		 * Copy shader material.
		 *
		 * @property material
		 * @type CopyMaterial
		 * @private
		 */

		this.material = new CopyMaterial();

		this.quad.material = this.material;

		/**
		 * The render target.
		 *
		 * @property renderTarget
		 * @type WebGLRenderTarget
		 */

		this.renderTarget = (renderTarget !== undefined) ? renderTarget : new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false,
			stencilBuffer: false,
			depthBuffer: false
		});

		/**
		 * Indicates whether the render target should be resized when the size of
		 * the composer's read/write buffer changes.
		 *
		 * @property resize
		 * @type Boolean
		 * @default true
		 */

		this.resize = resize;

	}

	/**
	 * Saves the read buffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

	}

	/**
	 * Adjusts the format of the render target.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		if(!alpha) {

			this.renderTarget.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
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
