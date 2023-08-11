import { Uniform, Vector2, Vector4 } from "three";
import { KernelSize } from "../enums/index.js";
import { updateFragmentShader } from "../utils/index.js";
import { KawaseBlurMaterial } from "./KawaseBlurMaterial.js";

import fragmentShader from "./glsl/convolution.tilt-shift.frag";
import vertexShader from "./glsl/convolution.tilt-shift.vert";

/**
 * A tilt shift blur material.
 */

export class TiltShiftBlurMaterial extends KawaseBlurMaterial {

	/**
	 * Constructs a new tilt shift blur material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.offset=0.0] - The relative offset of the focus area.
	 * @param {Number} [options.rotation=0.0] - The rotation of the focus area in radians.
	 * @param {Number} [options.focusArea=0.4] - The relative size of the focus area.
	 * @param {Number} [options.feather=0.3] - The softness of the focus area edges.
	 */

	constructor({
		kernelSize = KernelSize.MEDIUM,
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3
	} = {}) {

		super();

		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;
		this.kernelSize = kernelSize;

		this.fragmentShader = updateFragmentShader(this.fragmentShader);

		this.uniforms.aspect = new Uniform(1.0);
		this.uniforms.rotation = new Uniform(new Vector2());
		this.uniforms.maskParams = new Uniform(new Vector4());

		/**
		 * @see {@link offset}
		 * @type {Number}
		 * @private
		 */

		this._offset = offset;

		/**
		 * @see {@link focusArea}
		 * @type {Number}
		 * @private
		 */

		this._focusArea = focusArea;

		/**
		 * @see {@link feather}
		 * @type {Number}
		 * @private
		 */

		this._feather = feather;

		this.rotation = rotation;
		this.updateParams();

	}

	/**
	 * The relative offset of the focus area.
	 *
	 * @private
	 */

	updateParams() {

		const params = this.uniforms.maskParams.value;
		const a = Math.max(this.focusArea, 0.0);
		const b = Math.max(a - this.feather, 0.0);

		params.set(
			this.offset - a, this.offset - b,
			this.offset + a, this.offset + b
		);

	}

	/**
	 * The rotation of the focus area in radians.
	 *
	 * @type {Number}
	 */

	get rotation() {

		return Math.acos(this.uniforms.rotation.value.x);

	}

	set rotation(value) {

		this.uniforms.rotation.value.set(Math.cos(value), Math.sin(value));

	}

	/**
	 * The relative offset of the focus area.
	 *
	 * @type {Number}
	 */

	get offset() {

		return this._offset;

	}

	set offset(value) {

		this._offset = value;
		this.updateParams();

	}

	/**
	 * The relative size of the focus area.
	 *
	 * @type {Number}
	 */

	get focusArea() {

		return this._focusArea;

	}

	set focusArea(value) {

		this._focusArea = value;
		this.updateParams();

	}

	/**
	 * The softness of the focus area edges.
	 *
	 * @type {Number}
	 */

	get feather() {

		return this._feather;

	}

	set feather(value) {

		this._feather = value;
		this.updateParams();

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		super.setSize(width, height);
		this.uniforms.aspect.value = width / height;

	}

}
