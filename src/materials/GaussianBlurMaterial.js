import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";
import { GaussKernel } from "../core";

import fragmentShader from "./glsl/convolution/gaussian.frag";
import vertexShader from "./glsl/convolution/gaussian.vert";

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
				scale: new Uniform(new Vector2(1.0, 1.0))
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
		 * Backing data for {@link kernelSize}.
		 *
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
	 * The resolution scale.
	 *
	 * @type {Number}
	 * @internal
	 */

	set resolutionScale(value) {

		this.uniforms.scale.value.x = value;

	}

	/**
	 * The blur kernel scale. Values greater than 1.0 may introduce artifacts.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.uniforms.scale.value.y;

	}

	set scale(value) {

		this.uniforms.scale.value.y = value;

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

		// The kernel data is injected as const arrays to avoid uniform count limitations.
		let kernelData = `#define STEPS ${steps.toFixed(0)}\n\n`;
		kernelData += `const float gWeights[${steps}] = float[${steps}](\n\t`;
		kernelData += Array.from(kernel.linearWeights).map(v => v.toFixed(16)).join(",\n\t");
		kernelData += `\n);\n\nconst float gOffsets[${steps}] = float[${steps}](\n\t`;
		kernelData += Array.from(kernel.linearOffsets).map(v => v.toFixed(16)).join(",\n\t");
		this.fragmentShader = kernelData + "\n);\n\n" + fragmentShader;
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
