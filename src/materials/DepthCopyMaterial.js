import { BasicDepthPacking, NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/depth-copy/shader.frag";
import vertexShader from "./glsl/depth-copy/shader.vert";

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
				texelPosition: new Uniform(new Vector2())
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
		 * The current depth copy mode.
		 *
		 * @type {DepthCopyMode}
		 * @private
		 */

		this.depthCopyMode = DepthCopyMode.FULL;

	}

	/**
	 * The input depth buffer.
	 *
	 * @type {Texture}
	 */

	set depthBuffer(value) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The input depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	set inputDepthPacking(value) {

		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The output depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	get outputDepthPacking() {

		return Number(this.defines.OUTPUT_DEPTH_PACKING);

	}

	set outputDepthPacking(value) {

		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the input depth buffer.
	 *
	 * @deprecated Use depthBuffer and inputDepthPacking instead.
	 * @param {Texture} buffer - The depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {

		this.depthBuffer = buffer;
		this.inputDepthPacking = depthPacking;

	}

	/**
	 * Returns the current input depth packing strategy.
	 *
	 * @deprecated
	 * @return {DepthPackingStrategies} The input depth packing strategy.
	 */

	getInputDepthPacking() {

		return Number(this.defines.INPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the input depth packing strategy.
	 *
	 * @deprecated Use inputDepthPacking instead.
	 * @param {DepthPackingStrategies} value - The new input depth packing strategy.
	 */

	setInputDepthPacking(value) {

		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the current output depth packing strategy.
	 *
	 * @deprecated Use outputDepthPacking instead.
	 * @return {DepthPackingStrategies} The output depth packing strategy.
	 */

	getOutputDepthPacking() {

		return Number(this.defines.OUTPUT_DEPTH_PACKING);

	}

	/**
	 * Sets the output depth packing strategy.
	 *
	 * @deprecated Use outputDepthPacking instead.
	 * @param {DepthPackingStrategies} value - The new output depth packing strategy.
	 */

	setOutputDepthPacking(value) {

		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The screen space position used for single-texel copy operations.
	 *
	 * @type {Vector2}
	 */

	get texelPosition() {

		return this.uniforms.texelPosition.value;

	}

	/**
	 * Returns the screen space position used for single-texel copy operations.
	 *
	 * @deprecated Use texelPosition instead.
	 * @return {Vector2} The position.
	 */

	getTexelPosition() {

		return this.uniforms.texelPosition.value;

	}

	/**
	 * Sets the screen space position used for single-texel copy operations.
	 *
	 * @deprecated
	 * @param {Vector2} value - The position.
	 */

	setTexelPosition(value) {

		this.uniforms.texelPosition.value = value;

	}

	/**
	 * The depth copy mode.
	 *
	 * @type {DepthCopyMode}
	 */

	get mode() {

		return this.depthCopyMode;

	}

	set mode(value) {

		this.depthCopyMode = value;
		this.defines.DEPTH_COPY_MODE = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the depth copy mode.
	 *
	 * @deprecated Use mode instead.
	 * @return {DepthCopyMode} The depth copy mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the depth copy mode.
	 *
	 * @deprecated Use mode instead.
	 * @param {DepthCopyMode} value - The new mode.
	 */

	setMode(value) {

		this.mode = value;

	}

}
