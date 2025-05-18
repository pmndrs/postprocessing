import { Uniform, Vector2 } from "three";
import { GaussKernel } from "../utils/GaussKernel.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.gaussian.frag";
import vertexShader from "./shaders/convolution.gaussian.vert";

/**
 * Gaussian blur material options.
 *
 * @category Materials
 */

export interface GaussianBlurMaterialOptions {

	/**
	 * The kernel size. Must be an odd number.
	 *
	 * @defaultValue 35
	 */

	kernelSize?: number;

}

/**
 * An optimized Gaussian blur material.
 *
 * Based on "An investigation of fast real-time GPU-based image blur algorithms" by Filip Strugar, Intel, 2014.
 * @see https://www.intel.com/content/www/us/en/developer/articles/technical/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms.html)
 * @category Materials
 */

export class GaussianBlurMaterial extends FullscreenMaterial implements GaussianBlurMaterialOptions {

	/**
	 * @see {@link kernelSize}
	 */

	private _kernelSize: number;

	/**
	 * Constructs a new blur material.
	 *
	 * @param options - The options.
	 */

	constructor({ kernelSize = 35 }: GaussianBlurMaterialOptions = {}) {

		super({
			name: "GaussianBlurMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				STEPS: 0
			},
			uniforms: {
				direction: new Uniform(new Vector2()),
				kernel: new Uniform(null),
				scale: new Uniform(1.0)
			}
		});

		this._kernelSize = 0;
		this.kernelSize = kernelSize;

	}

	get kernelSize(): number {

		return this._kernelSize;

	}

	set kernelSize(value: number) {

		this._kernelSize = value;
		this.generateKernel(value);

	}

	/**
	 * The blur direction.
	 */

	get direction(): Vector2 {

		return this.uniforms.direction.value as Vector2;

	}

	/**
	 * The blur kernel scale. Values greater than 1.0 may introduce artifacts.
	 */

	get scale(): number {

		return this.uniforms.scale.value as number;

	}

	set scale(value: number) {

		this.uniforms.scale.value = value;

	}

	/**
	 * Generates the Gauss kernel.
	 *
	 * @param kernelSize - The kernel size.
	 */

	private generateKernel(kernelSize: number): void {

		const kernel = new GaussKernel(kernelSize);
		const steps = kernel.linearSteps;

		// Store offsets and weights as vec2 instances to minimize the uniform count.
		const kernelData = new Float64Array(steps * 2);

		for(let i = 0, j = 0; i < steps; ++i) {

			kernelData[j++] = kernel.linearOffsets[i];
			kernelData[j++] = kernel.linearWeights[i];

		}

		this.uniforms.kernel.value = kernelData;
		this.defines.STEPS = steps;
		this.needsUpdate = true;

	}

}
