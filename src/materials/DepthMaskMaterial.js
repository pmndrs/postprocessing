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

			type: "DepthMaskMaterial",

			defines: {
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

			fragmentShader,
			vertexShader,

			blending: NoBlending,
			depthWrite: false,
			depthTest: false

		});

		/** @ignore */
		this.toneMapped = false;

		/**
		 * The current depth mode.
		 *
		 * @type {Number}
		 * @private
		 */

		this.depthMode = LessDepth;
		this.setDepthMode(LessDepth);

	}

	/**
	 * Indicates whether the background should be preserved.
	 *
	 * Enabled by default.
	 *
	 * @type {Boolean}
	 */

	get keepFar() {

		return (this.defines.KEEP_FAR !== undefined);

	}

	/**
	 * Controls whether the background will be preserved or discarded.
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
	 * Returns the current depth mode.
	 *
	 * @return {Number} The depth mode.
	 */

	getDepthMode() {

		return this.depthMode;

	}

	/**
	 * Sets the depth mode.
	 *
	 * Default is `LessDepth`.
	 *
	 * @see https://threejs.org/docs/#api/en/constants/Materials
	 * @param {Number} mode - The depth mode.
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
				depthTest = "abs(d1 - d0) <= EPSILON";
				break;

			case NotEqualDepth:
				depthTest = "abs(d1 - d0) > EPSILON";
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
