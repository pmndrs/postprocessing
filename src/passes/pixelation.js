import { PixelationMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A pixelation pass.
 */

export class PixelationPass extends Pass {

	/**
	 * Constructs a new pixelation pass.
	 *
	 * @param {Number} [granularity=30.0] - The intensity of the effect.
	 */

	constructor(granularity = 30.0) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "PixelationPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A pixelation shader material.
		 *
		 * @type {PixelationMaterial}
		 * @private
		 */

		this.pixelationMaterial = new PixelationMaterial();

		this.granularity = granularity;

		this.quad.material = this.pixelationMaterial;

	}

	/**
	 * The pixel granularity.
	 *
	 * @type {Number}
	 * @default 30.0
	 */

	get granularity() { return this.pixelationMaterial.granularity; }

	/**
	 * A higher value yields coarser visuals.
	 *
	 * @type {Number}
	 */

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
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.pixelationMaterial.setResolution(width, height);

	}

}
