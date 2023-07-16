import { Uniform, Vector2, Vector4 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/pixelation.frag";

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
				["d", new Uniform(new Vector4())]
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
		 * Backing data for {@link granularity}.
		 *
		 * @type {Number}
		 * @private
		 */

		this._granularity = 0;
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

		return this._granularity;

	}

	set granularity(value) {

		let d = Math.floor(value);

		if(d % 2 > 0) {

			d += 1;

		}

		this._granularity = d;
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

		const resolution = this.resolution;
		resolution.set(width, height);

		const d = this.granularity;
		const x = d / resolution.x;
		const y = d / resolution.y;
		this.uniforms.get("d").value.set(x, y, 1.0 / x, 1.0 / y);

	}

}
