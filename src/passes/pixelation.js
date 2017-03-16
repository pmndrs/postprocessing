import { PixelationMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A pixelation pass.
 *
 * @class PixelationPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Number} [granularity=30.0] - The intensity of the effect.
 */

export class PixelationPass extends Pass {

	constructor(granularity = 30.0) {

		super();

		this.name = "PixelationPass";
		this.needsSwap = true;

		/**
		 * A pixelation shader material.
		 *
		 * @property pixelationMaterial
		 * @type PixelationMaterial
		 * @private
		 */

		this.pixelationMaterial = new PixelationMaterial();

		this.granularity = granularity;

		this.quad.material = this.pixelationMaterial;

	}

	/**
	 * The pixel granularity. A higher value yields coarser visuals.
	 *
	 * @property granularity
	 * @type Number
	 * @default 30.0
	 */

	get granularity() { return this.pixelationMaterial.granularity; }

	set granularity(x) {

		if(typeof x === "number") {

			x = Math.floor(x);

			if(x % 2 > 0) {

				x += 1;

			}

			this.pixelationMaterial.granularity = x;

		}

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.pixelationMaterial.uniforms.tDiffuse.value = readBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.pixelationMaterial.setResolution(width, height);

	}

}
