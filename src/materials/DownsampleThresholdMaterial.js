import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/downsample-threshold.frag";
import vertexShader from "./glsl/downsample-threshold.vert";

/**
 * A downsample threshold shader material.
 *
 * This down-samples the input buffer while applying threshold.
 * Based on the article:
 * https://learnopengl.com/Guest-Articles/2022/Phys.-Based-Bloom
 * which refers to a presentation by Sledgehammer Games:
 * https://www.iryoku.com/next-generation-post-processing-in-call-of-duty-advanced-warfare/
 *
 * @implements {Resizable}
 */

export class DownsampleThresholdMaterial extends ShaderMaterial {

	/**
	 * Constructs a new downsample threshold material.
	 */

	constructor() {

		super({
			name: "DownsampleThresholdMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				thresholdLevel: new Uniform(1.0),
				thresholdRange: new Uniform(0.1)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

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
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

	/**
	 * The level of threshold.
	 *
	 * @type {Number}
	 */

	get thresholdLevel() {

		return this.uniforms.thresholdLevel.value;

	}

	set thresholdLevel(value) {

		this.uniforms.thresholdLevel.value = value;

	}

	/**
	 * The range of threshold.
	 *
	 * @type {Number}
	 */

	get thresholdRange() {

		return this.uniforms.thresholdRange.value;

	}

	set thresholdRange(value) {

		this.uniforms.thresholdRange.value = value;

	}

}
