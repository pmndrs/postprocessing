import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/downsample-threshold.frag";
import vertexShader from "./glsl/downsample-threshold.vert";

/**
 * A downsample threshold material.
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
				luminanceThreshold: new Uniform(0.5),
				luminanceSmoothing: new Uniform(0.1)
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
	 * The luminance threshold.
	 *
	 * @type {Number}
	 */

	get luminanceThreshold() {

		return this.uniforms.luminanceThreshold.value;

	}

	set luminanceThreshold(value) {

		this.uniforms.luminanceThreshold.value = value;

	}

	/**
	 * The luminance threshold smoothing.
	 *
	 * @type {Number}
	 */

	get luminanceSmoothing() {

		return this.uniforms.luminanceSmoothing.value;

	}

	set luminanceSmoothing(value) {

		this.uniforms.luminanceSmoothing.value = value;

	}

}
