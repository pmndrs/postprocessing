import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/depth-copy/shader.frag";
import vertexShader from "./glsl/depth-copy/shader.vert";

/**
 * A depth copy shader material.
 */

export class DepthCopyMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth copy material.
	 */

	constructor() {

		super({

			type: "DepthCopyMaterial",

			defines: {
				INPUT_DEPTH_PACKING: "0",
				OUTPUT_DEPTH_PACKING: "0",
				DEPTH_COPY_MODE: "0"
			},

			uniforms: {
				depthBuffer: new Uniform(null),
				screenPosition: new Uniform(new Vector2())
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
		 * The depth copy mode.
		 *
		 * @type {DepthCopyMode}
		 * @private
		 */

		this.mode = DepthCopyMode.FULL;

	}

	/**
	 * The current input depth packing.
	 *
	 * @type {Number}
	 */

	get inputDepthPacking() {

		return Number(this.defines.INPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the input depth packing.
	 *
	 * @type {Number}
	 */

	set inputDepthPacking(value) {

		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The current output depth packing.
	 *
	 * @type {Number}
	 */

	get outputDepthPacking() {

		return Number(this.defines.OUTPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the output depth packing.
	 *
	 * @type {Number}
	 */

	set outputDepthPacking(value) {

		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The depth copy mode.
	 *
	 * @type {DepthCopyMode}
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the depth copy mode.
	 *
	 * @type {DepthCopyMode}
	 */

	setMode(mode) {

		this.mode = mode;
		this.defines.DEPTH_COPY_MODE = mode.toFixed(0);
		this.needsUpdate = true;

	}

}

/**
 * An enumeration of depth copy modes.
 *
 * @type {Object}
 * @property {Number} FULL - Copies the full depth texture every frame.
 * @property {Number} SINGLE - Copies a single texel from the depth texture on demand.
 */

export const DepthCopyMode = {

	FULL: 0,
	SINGLE: 1

};
