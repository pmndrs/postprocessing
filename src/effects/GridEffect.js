import { Uniform, Vector2 } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/grid.frag";

/**
 * A grid effect.
 */

export class GridEffect extends Effect {

	/**
	 * Constructs a new grid effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
	 * @param {Number} [options.scale=1.0] - The scale of the grid pattern.
	 * @param {Number} [options.lineWidth=0.0] - The line width of the grid pattern.
	 */

	constructor({ blendFunction = BlendFunction.OVERLAY, scale = 1.0, lineWidth = 0.0 } = {}) {

		super("GridEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["scale", new Uniform(new Vector2())],
				["lineWidth", new Uniform(lineWidth)]
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
		 * The grid scale, relative to the screen height.
		 *
		 * @type {Number}
		 * @private
		 */

		this.s = 0;
		this.scale = scale;

		/**
		 * The grid line width.
		 *
		 * @type {Number}
		 * @private
		 */

		this.l = 0;
		this.lineWidth = lineWidth;

	}

	/**
	 * The scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.s;

	}

	set scale(value) {

		this.s = Math.max(value, 1e-6);
		this.setSize(this.resolution.width, this.resolution.height);

	}

	/**
	 * Returns the current grid scale.
	 *
	 * @deprecated Use scale instead.
	 * @return {Number} The grid scale.
	 */

	getScale() {

		return this.scale;

	}

	/**
	 * Sets the grid scale.
	 *
	 * @deprecated Use scale instead.
	 * @param {Number} value - The new grid scale.
	 */

	setScale(value) {

		this.scale = value;

	}

	/**
	 * The line width.
	 *
	 * @type {Number}
	 */

	get lineWidth() {

		return this.l;

	}

	set lineWidth(value) {

		this.l = value;
		this.setSize(this.resolution.width, this.resolution.height);

	}

	/**
	 * Returns the current grid line width.
	 *
	 * @deprecated Use lineWidth instead.
	 * @return {Number} The grid line width.
	 */

	getLineWidth() {

		return this.lineWidth;

	}

	/**
	 * Sets the grid line width.
	 *
	 * @deprecated Use lineWidth instead.
	 * @param {Number} value - The new grid line width.
	 */

	setLineWidth(value) {

		this.lineWidth = value;

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);

		const aspect = width / height;
		const scale = this.scale * (height * 0.125);

		this.uniforms.get("scale").value.set(aspect * scale, scale);
		this.uniforms.get("lineWidth").value = (scale / height) + this.lineWidth;

	}

}
