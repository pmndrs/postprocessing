import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/pixelation/shader.frag";

/**
 * A pixelation effect.
 *
 * Warning: This effect cannot be merged with convolution effects.
 */

export class PixelationEffect extends Effect {

	/**
	 * Constructs a new pixelation effect.
	 *
	 * @param {Object} [granularity=30.0] - The pixel granularity.
	 */

	constructor(granularity = 30.0) {

		super("PixelationEffect", fragmentShader, {

			uniforms: new Map([
				["active", new Uniform(false)],
				["d", new Uniform(new Vector2())]
			])

		});

		/**
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * The pixel granularity.
		 *
		 * @type {Number}
		 * @private
		 */

		this.granularity = granularity;

	}

	/**
	 * Returns the pixel granularity.
	 *
	 * @return {Number} The granularity.
	 */

	getGranularity() {

		return this.granularity;

	}

	/**
	 * Sets the pixel granularity.
	 *
	 * A higher value yields coarser visuals.
	 *
	 * @param {Number} granularity - The new granularity.
	 */

	setGranularity(granularity) {

		granularity = Math.floor(granularity);

		if(granularity % 2 > 0) {

			granularity += 1;

		}

		const uniforms = this.uniforms;
		uniforms.get("active").value = (granularity > 0.0);
		uniforms.get("d").value.set(granularity, granularity).divide(this.resolution);

		this.granularity = granularity;

	}

	/**
	 * Updates the granularity.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.setGranularity(this.granularity);

	}

}
