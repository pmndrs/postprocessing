import { Texture, Uniform } from "three";
import { orthographicDepthToViewZ, viewZToOrthographicDepth } from "../utils/camera.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/convolution.box.frag";
import vertexShader from "./shaders/convolution.box.vert";

/**
 * Box blur material options.
 *
 * @group Materials
 */

export interface BoxBlurMaterialOptions {

	/**
	 * The blur kernel size. Default is `false`.
	 */

	bilateral?: boolean;

	/**
	 * The blur kernel size. Default is `5`.
	 */

	kernelSize?: number;

}

/**
 * A fast box blur material that supports depth-based bilateral filtering.
 *
 * @group Materials
 */

export class BoxBlurMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new box blur material.
	 *
	 * @param options - The options.
	 */

	constructor({ bilateral = false, kernelSize = 5 }: BoxBlurMaterialOptions = {}) {

		super({
			name: "BoxBlurMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				DISTANCE_THRESHOLD: "0.1"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				normalDepthBuffer: new Uniform(null),
				scale: new Uniform(1.0)
			}
		});

		this.bilateral = bilateral;
		this.kernelSize = kernelSize;
		this.maxVaryingVectors = 8;

	}

	/**
	 * The maximum amount of varying vectors.
	 *
	 * Should be synced with `renderer.capabilities.maxVaryings`. Default is `8` (minimum).
	 */

	set maxVaryingVectors(value: number) {

		this.defines.MAX_VARYING_VECTORS = value.toFixed(0);

	}

	/**
	 * The kernel size.
	 *
	 * - Must be an odd number
	 * - Kernel size `3` and `5` use optimized code paths
	 * - Default is `5`
	 */

	get kernelSize(): number {

		return Number(this.defines.KERNEL_SIZE);

	}

	set kernelSize(value: number) {

		if(value % 2 === 0) {

			throw new Error("The kernel size must be an odd number");

		}

		this.defines.KERNEL_SIZE = value.toFixed(0);
		this.defines.KERNEL_SIZE_HALF = Math.floor(value / 2).toFixed(0);
		this.defines.KERNEL_SIZE_SQ = (value ** 2).toFixed(0);
		this.defines.KERNEL_SIZE_SQ_HALF = Math.floor(value ** 2 / 2).toFixed(0);
		this.defines.INV_KERNEL_SIZE_SQ = (1 / value ** 2).toFixed(6);
		this.needsUpdate = true;

	}

	/**
	 * The blur scale.
	 */

	get scale(): number {

		return this.uniforms.scale.value as number;

	}

	set scale(value: number) {

		this.uniforms.scale.value = value;

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * A combined normal-depth buffer. Overrides {@link depthBuffer} if set.
	 */

	set normalDepthBuffer(value: Texture) {

		this.uniforms.normalDepthBuffer.value = value;

		if(value !== null) {

			this.defines.NORMAL_DEPTH = "1";

		} else {

			delete this.defines.NORMAL_DEPTH;

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether bilateral filtering is enabled.
	 */

	get bilateral(): boolean {

		return (this.defines.BILATERAL !== undefined);

	}

	set bilateral(value: boolean) {

		if(value !== null) {

			this.defines.BILATERAL = "1";

		} else {

			delete this.defines.BILATERAL;

		}

		this.needsUpdate = true;

	}

	/**
	 * The bilateral filter distance threshold in world units.
	 */

	get worldDistanceThreshold(): number {

		return -orthographicDepthToViewZ(Number(this.defines.DISTANCE_THRESHOLD), this.near, this.far);

	}

	set worldDistanceThreshold(value: number) {

		const threshold = viewZToOrthographicDepth(-value, this.near, this.far);
		this.defines.DISTANCE_THRESHOLD = threshold.toFixed(12);
		this.needsUpdate = true;

	}

}
