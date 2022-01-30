import {
	AlwaysDepth,
	EqualDepth,
	GreaterDepth,
	GreaterEqualDepth,
	LessDepth,
	LessEqualDepth,
	NeverDepth,
	NoBlending,
	NotEqualDepth,
	ShaderMaterial,
	Uniform
} from "three";

import fragmentShader from "./glsl/depth-mask/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A depth mask shader material.
 *
 * This material masks a color buffer by comparing two depth textures.
 */

export class DepthMaskMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth mask material.
	 */

	constructor() {

		super({
			name: "DepthMaskMaterial",
			defines: {
				DEPTH_EPSILON: "0.00001",
				DEPTH_PACKING_0: "0",
				DEPTH_PACKING_1: "0",
				KEEP_FAR: "1"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null),
				bias0: new Uniform(0.0),
				bias1: new Uniform(0.0)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		/**
		 * The current depth mode.
		 *
		 * @type {DepthModes}
		 * @private
		 */

		this.depthMode = LessDepth;
		this.setDepthMode(LessDepth);

	}

	/**
	 * Indicates whether maximum depth values should be preserved. Enabled by default.
	 *
	 * @type {Boolean}
	 */

	get keepFar() {

		return (this.defines.KEEP_FAR !== undefined);

	}

	/**
	 * Controls whether maximum depth values should be preserved.
	 *
	 * @type {Boolean}
	 */

	set keepFar(value) {

		if(value) {

			this.defines.KEEP_FAR = "1";

		} else {

			delete this.defines.KEEP_FAR;

		}

		this.needsUpdate = true;

	}

	/**
	 * Returns the current error threshold for depth comparisons.
	 *
	 * This value is only used for `EqualDepth` and `NotEqualDepth`.
	 *
	 * @return {Number} The error threshold. Default is `1e-5`.
	 */

	getEpsilon() {

		return Number(this.defines.DEPTH_EPSILON);

	}

	/**
	 * Sets the depth comparison error threshold.
	 *
	 * This value is only used for `EqualDepth` and `NotEqualDepth`.
	 *
	 * @param {Number} value - The new error threshold.
	 */

	setEpsilon(value) {

		this.defines.DEPTH_EPSILON = value.toFixed(16);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current depth mode.
	 *
	 * @return {DepthModes} The depth mode. Default is `LessDepth`.
	 */

	getDepthMode() {

		return this.depthMode;

	}

	/**
	 * Sets the depth mode.
	 *
	 * @see https://threejs.org/docs/#api/en/constants/Materials
	 * @param {DepthModes} mode - The depth mode.
	 */

	setDepthMode(mode) {

		// If the depth test fails, the texel will be discarded.
		let depthTest;

		switch(mode) {

			case NeverDepth:
				depthTest = "false";
				break;

			case AlwaysDepth:
				depthTest = "true";
				break;

			case EqualDepth:
				depthTest = "abs(d1 - d0) <= DEPTH_EPSILON";
				break;

			case NotEqualDepth:
				depthTest = "abs(d1 - d0) > DEPTH_EPSILON";
				break;

			case LessDepth:
				depthTest = "d0 > d1";
				break;

			case LessEqualDepth:
				depthTest = "d0 >= d1";
				break;

			case GreaterEqualDepth:
				depthTest = "d0 <= d1";
				break;

			case GreaterDepth:
			default:
				depthTest = "d0 < d1";
				break;

		}

		this.depthMode = mode;
		this.defines["depthTest(d0, d1)"] = depthTest;
		this.needsUpdate = true;

	}

}
