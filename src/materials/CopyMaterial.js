import { AlwaysDepth, NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/copy.frag";
import vertexShader from "./glsl/common.vert";

/**
 * A simple copy shader material.
 */

export class CopyMaterial extends ShaderMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor() {

		super({
			name: "CopyMaterial",
			defines: {
				DEPTH_PACKING: "0",
				COLOR_WRITE: "1"
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				channelWeights: new Uniform(null),
				opacity: new Uniform(1.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.depthFunc = AlwaysDepth;

	}

	/**
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	get inputBuffer() {

		return this.uniforms.inputBuffer.value;

	}

	set inputBuffer(value) {

		const colorWrite = value !== null;

		if(this.colorWrite !== colorWrite) {

			if(colorWrite) {

				this.defines.COLOR_WRITE = true;

			} else {

				delete this.defines.COLOR_WRITE;

			}

			this.colorWrite = colorWrite;
			this.needsUpdate = true;

		}

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * A depth buffer.
	 *
	 * @type {Texture}
	 */

	get depthBuffer() {

		return this.uniforms.depthBuffer.value;

	}

	set depthBuffer(value) {

		const depthWrite = value !== null;

		if(this.depthWrite !== depthWrite) {

			if(depthWrite) {

				this.defines.DEPTH_WRITE = true;

			} else {

				delete this.defines.DEPTH_WRITE;

			}

			this.depthTest = depthWrite;
			this.depthWrite = depthWrite;
			this.needsUpdate = true;

		}

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The depth packing strategy of the depth buffer.
	 *
	 * @type {DepthPackingStrategies}
	 */

	set depthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Color channel weights that modulate texels from the input buffer.
	 *
	 * Set to `null` to disable.
	 *
	 * @type {Vector4 | null}
	 */

	get channelWeights() {

		return this.uniforms.channelWeights.value;

	}

	set channelWeights(value) {

		if(value !== null) {

			this.defines.USE_WEIGHTS = "1";
			this.uniforms.channelWeights.value = value;

		} else {

			delete this.defines.USE_WEIGHTS;

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Number} value - The buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Returns the opacity.
	 *
	 * @deprecated Use opacity instead.
	 * @return {Number} The opacity.
	 */

	getOpacity(value) {

		return this.uniforms.opacity.value;

	}

	/**
	 * Sets the opacity.
	 *
	 * @deprecated Use opacity instead.
	 * @param {Number} value - The opacity.
	 */

	setOpacity(value) {

		this.uniforms.opacity.value = value;

	}

}
