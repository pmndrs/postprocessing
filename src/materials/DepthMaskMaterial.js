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
	PerspectiveCamera,
	ShaderMaterial,
	Uniform,
	Vector2
} from "three";

import { DepthTestStrategy } from "../enums/index.js";

import fragmentShader from "./glsl/depth-mask.frag";
import vertexShader from "./glsl/common.vert";

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
				DEPTH_EPSILON: "0.0001",
				DEPTH_PACKING_0: "0",
				DEPTH_PACKING_1: "0",
				DEPTH_TEST_STRATEGY: DepthTestStrategy.KEEP_MAX_DEPTH
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer0: new Uniform(null),
				depthBuffer1: new Uniform(null),
				cameraNearFar: new Uniform(new Vector2(1, 1))
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

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
	 * A small error threshold that is used for `EqualDepth` and `NotEqualDepth` tests. Default is `1e-4`.
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
	 * Returns the current error threshold for depth comparisons.
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

	/**
	 * Copies the settings of the given camera.
	 *
	 * @deprecated Use copyCameraSettings instead.
	 * @param {Camera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		this.copyCameraSettings(camera);

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @param {Camera} camera - A camera.
	 */

	copyCameraSettings(camera) {

		if(camera) {

			this.uniforms.cameraNearFar.value.set(camera.near, camera.far);

			if(camera instanceof PerspectiveCamera) {

				this.defines.PERSPECTIVE_CAMERA = "1";

			} else {

				delete this.defines.PERSPECTIVE_CAMERA;

			}

			this.needsUpdate = true;

		}

	}

}
