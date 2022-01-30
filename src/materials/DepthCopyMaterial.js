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
			name: "DepthCopyMaterial",
			defines: {
				INPUT_DEPTH_PACKING: "0",
				OUTPUT_DEPTH_PACKING: "0",
				DEPTH_COPY_MODE: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				screenPosition: new Uniform(new Vector2())
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
		 * The depth copy mode.
		 *
		 * @type {DepthCopyMode}
		 * @private
		 */

		this.mode = DepthCopyMode.FULL;

	}

	/**
	 * Returns the current input depth packing strategy.
	 *
	 * @return {DepthPackingStrategies} The input depth packing strategy.
	 */

	getInputDepthPacking() {

		return Number(this.defines.INPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the input depth packing strategy.
	 *
	 * @param {DepthPackingStrategies} value - The new input depth packing strategy.
	 */

	setInputDepthPacking(value) {

		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current output depth packing strategy.
	 *
	 * @return {DepthPackingStrategies} The output depth packing strategy.
	 */

	getOutputDepthPacking() {

		return Number(this.defines.OUTPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the output depth packing strategy.
	 *
	 * @param {DepthPackingStrategies} value - The new output depth packing strategy.
	 */

	setOutputDepthPacking(value) {

		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the depth copy mode.
	 *
	 * @return {DepthCopyMode} The depth copy mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the depth copy mode.
	 *
	 * @param {DepthCopyMode} value - The new mode.
	 */

	setMode(value) {

		this.mode = value;
		this.defines.DEPTH_COPY_MODE = value.toFixed(0);
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
