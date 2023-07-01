import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";
import { updateFragmentShader } from "../utils";
import { GaussKernel } from "../core";

import fragmentShader from "./glsl/convolution.gaussian.frag";
import vertexShader from "./glsl/convolution.gaussian.vert";

/**
 * An optimized Gaussian convolution shader material.
 *
 * References:
 *
 * Filip Strugar, Intel, 2014: [An investigation of fast real-time GPU-based image blur algorithms](
 * https://www.intel.com/content/www/us/en/developer/articles/technical/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms.html)
 *
 * @implements {Resizable}
 */

export class GaussianBlurMaterial extends ShaderMaterial {

	/**
	 * Constructs a new convolution material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.kernelSize=35] - The kernel size.
	 */

	constructor({ kernelSize = 35 } = {}) {

		super({
			name: "GaussianBlurMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				direction: new Uniform(new Vector2()),
				kernel: new Uniform(null),
				scale: new Uniform(1.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.fragmentShader = updateFragmentShader(this.fragmentShader);

		/**
		 * @see {@link kernelSize}
		 * @type {Number}
		 * @private
		 */

		this._kernelSize = 0;
		this.kernelSize = kernelSize;

	}

	/**
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The kernel size.
	 *
	 * @type {Number}
	 */

	get kernelSize() {

		return this._kernelSize;

	}

	set kernelSize(value) {

		this._kernelSize = value;
		this.generateKernel(value);

	}

	/**
	 * The blur direction.
	 *
	 * @type {Vector2}
	 */

	get direction() {

		return this.uniforms.direction.value;

	}

	/**
	 * The blur kernel scale. Values greater than 1.0 may introduce artifacts.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.uniforms.scale.value;

	}

	set scale(value) {

		this.uniforms.scale.value = value;

	}

	/**
	 * Generates the Gauss kernel.
	 *
	 * @param {KernelSize} kernelSize - The kernel size. Should be an odd number.
	 * @private
	 */

	generateKernel(kernelSize) {

		const kernel = new GaussKernel(kernelSize);
		const steps = kernel.linearSteps;

		// Store offsets and weights as vec2 instances to minimize the uniform count.
		const kernelData = new Float64Array(steps * 2);

		for(let i = 0, j = 0; i < steps; ++i) {

			kernelData[j++] = kernel.linearOffsets[i];
			kernelData[j++] = kernel.linearWeights[i];

		}

		this.uniforms.kernel.value = kernelData;
		this.defines.STEPS = steps.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
