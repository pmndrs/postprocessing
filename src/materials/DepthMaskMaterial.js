import {
	AlwaysDepth,
	BasicDepthPacking,
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
 * An enumeration of depth test strategies.
 *
 * @type {Object}
 * @property {Number} DEFAULT - Perform depth test only.
 * @property {Number} KEEP_MAX_DEPTH - Always keep max depth.
 * @property {Number} DISCARD_MAX_DEPTH - Always discard max depth.
 */

export const DepthTestStrategy = {
	DEFAULT: 0,
	KEEP_MAX_DEPTH: 1,
	DISCARD_MAX_DEPTH: 2
};

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
				DEPTH_TEST_STRATEGY: DepthTestStrategy.KEEP_MAX_DEPTH
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		this.depthMode = LessDepth;

	}

	/**
	 * The primary depth buffer.
	 *
	 * @type {Texture}
	 */

	set depthBuffer0(value) {

		this.uniforms.depthBuffer0.value = value;

	}

	/**
	 * The primary depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	set depthPacking0(value) {

		this.defines.DEPTH_PACKING_0 = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the base depth buffer.
	 *
	 * @deprecated Use depthBuffer0 and depthPacking0 instead.
	 * @param {Texture} buffer - The depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthBuffer0(buffer, depthPacking = BasicDepthPacking) {

		this.depthBuffer0 = buffer;
		this.depthPacking0 = depthPacking;

	}

	/**
	 * The secondary depth buffer.
	 *
	 * @type {Texture}
	 */

	set depthBuffer1(value) {

		this.uniforms.depthBuffer1.value = value;

	}

	/**
	 * The secondary depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	set depthPacking1(value) {

		this.defines.DEPTH_PACKING_1 = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the depth buffer that will be compared with the base depth buffer.
	 *
	 * @deprecated Use depthBuffer1 and depthPacking1 instead.
	 * @param {Texture} buffer - The depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthBuffer1(buffer, depthPacking = BasicDepthPacking) {

		this.depthBuffer1 = buffer;
		this.depthPacking1 = depthPacking;

	}

	/**
	 * The strategy for handling maximum depth.
	 *
	 * @type {DepthTestStrategy}
	 */

	get maxDepthStrategy() {

		return Number(this.defines.DEPTH_TEST_STRATEGY);

	}

	set maxDepthStrategy(value) {

		this.defines.DEPTH_TEST_STRATEGY = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether maximum depth values should be preserved.
	 *
	 * @type {Boolean}
	 * @deprecated Use maxDepthStrategy instead.
	 */

	get keepFar() {

		return this.maxDepthStrategy;

	}

	set keepFar(value) {

		this.maxDepthStrategy = value ? DepthTestStrategy.KEEP_MAX_DEPTH : DepthTestStrategy.DISCARD_MAX_DEPTH;

	}

	/**
	 * Returns the strategy for dealing with maximum depth values.
	 *
	 * @deprecated Use maxDepthStrategy instead.
	 * @return {DepthTestStrategy} The strategy.
	 */

	getMaxDepthStrategy() {

		return this.maxDepthStrategy;

	}

	/**
	 * Sets the strategy for dealing with maximum depth values.
	 *
	 * @deprecated Use maxDepthStrategy instead.
	 * @param {DepthTestStrategy} value - The strategy.
	 */

	setMaxDepthStrategy(value) {

		this.maxDepthStrategy = value;

	}

	/**
	 * A small error threshold that is used for `EqualDepth` and `NotEqualDepth` tests. Default is `1e-5`.
	 *
	 * @type {Number}
	 */

	get epsilon() {

		return Number(this.defines.DEPTH_EPSILON);

	}

	set epsilon(value) {

		this.defines.DEPTH_EPSILON = value.toFixed(16);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current error threshold for depth comparisons. Default is `1e-5`.
	 *
	 * @deprecated Use epsilon instead.
	 * @return {Number} The error threshold.
	 */

	getEpsilon() {

		return this.epsilon;

	}

	/**
	 * Sets the depth comparison error threshold.
	 *
	 * @deprecated Use epsilon instead.
	 * @param {Number} value - The new error threshold.
	 */

	setEpsilon(value) {

		this.epsilon = value;

	}

	/**
	 * The depth mode.
	 *
	 * @see https://threejs.org/docs/#api/en/constants/Materials
	 * @type {DepthModes}
	 */

	get depthMode() {

		return Number(this.defines.DEPTH_MODE);

	}

	set depthMode(value) {

		// If the depth test fails, the texel will be discarded.
		let depthTest;

		switch(value) {

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

		this.defines.DEPTH_MODE = value.toFixed(0);
		this.defines["depthTest(d0, d1)"] = depthTest;
		this.needsUpdate = true;

	}

	/**
	 * Returns the current depth mode.
	 *
	 * @deprecated Use depthMode instead.
	 * @return {DepthModes} The depth mode. Default is `LessDepth`.
	 */

	getDepthMode() {

		return this.depthMode;

	}

	/**
	 * Sets the depth mode.
	 *
	 * @deprecated Use depthMode instead.
	 * @param {DepthModes} mode - The depth mode.
	 */

	setDepthMode(mode) {

		this.depthMode = mode;

	}

}
