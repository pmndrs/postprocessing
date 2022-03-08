import { Uniform, Vector2 } from "three";
import { Effect } from "./Effect";

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

		this.d = 0;
		this.granularity = granularity;

	}

	/**
	 * The pixel granularity.
	 *
	 * A higher value yields coarser visuals.
	 *
	 * @type {Number}
	 */

	get granularity() {

		return this.d;

	}

	set granularity(value) {

		let d = Math.floor(value);

		if(d % 2 > 0) {

			d += 1;

		}

		this.d = d;
		this.uniforms.get("active").value = (d > 0);
		this.setSize(this.resolution.width, this.resolution.height);

	}

	/**
	 * Returns the pixel granularity.
	 *
	 * @deprecated Use granularity instead.
	 * @return {Number} The granularity.
	 */

	getGranularity() {

		return this.granularity;

	}

	/**
	 * Sets the pixel granularity.
	 *
	 * @deprecated Use granularity instead.
	 * @param {Number} value - The new granularity.
	 */

	setGranularity(value) {

		this.granularity = value;

	}

	/**
	 * Updates the granularity.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.uniforms.get("d").value.setScalar(this.d).divide(this.resolution);

	}

}
