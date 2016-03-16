import { CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A save pass that renders the result from a previous 
 * pass (readBuffer) to an arbitrary render target.
 *
 * @class SavePass
 * @constructor
 * @extends Pass
 * @param {Scene} renderTarget - The render target to use for saving the read buffer.
 * @param {Boolean} [resize] - Whether the render target should adjust to the size of the read/write buffer.
 */

export class SavePass extends Pass {

	constructor(renderTarget, resize) {

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
		 * @private
		 */

		this.renderTarget = (renderTarget !== undefined) ? renderTarget : null;

		/**
		 * Indicates whether the render target should be resized when
		 * the size of the composer's read/write buffer changes.
		 *
		 * @property resize
		 * @type Boolean
		 * @default true
		 */

		this.resize = (resize !== undefined) ? resize : true;

	}

	/**
	 * Saves the read buffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer;
		renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		if(this.resize && this.renderTarget !== null) {

			if(width <= 0) { width = 1; }
			if(height <= 0) { height = 1; }

			this.renderTarget.setSize(width, height);

		}

	}

}
