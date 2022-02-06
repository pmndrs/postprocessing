import { NoBlending, ShaderMaterial, Uniform, Vector2, Vector4 } from "three";

import fragmentShader from "./glsl/bokeh/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A bokeh disc blur material.
 *
 * This material should be applied twice in a row, with `fill` mode enabled for the second pass. Enabling the
 * `foreground` option causes the shader to combine the near and far CoC values around foreground objects.
 *
 * @implements {Resizable}
 */

export class BokehMaterial extends ShaderMaterial {

	/**
	 * Constructs a new bokeh material.
	 *
	 * @param {Boolean} [fill=false] - Enables or disables the bokeh highlight fill mode.
	 * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
	 */

	constructor(fill = false, foreground = false) {

		super({
			name: "BokehMaterial",
			defines: {
				PASS: fill ? "2" : "1"
			},
			uniforms: {
				kernel64: new Uniform(null),
				kernel16: new Uniform(null),
				inputBuffer: new Uniform(null),
				cocBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				scale: new Uniform(1.0)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		if(foreground) {

			this.defines.FOREGROUND = "1";

		}

		this.generateKernel();

	}

	/**
	 * Sets the input buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the circle of confusion buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setCoCBuffer(value) {

		this.uniforms.cocBuffer.value = value;

	}

	/**
	 * Returns the blur scale.
	 *
	 * @return {Number} The scale.
	 */

	getScale(value) {

		return this.uniforms.scale.value = value;

	}

	/**
	 * Sets the blur scale.
	 *
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		this.uniforms.scale.value = value;

	}

	/**
	 * Generates the blur kernel.
	 *
	 * @private
	 */

	generateKernel() {

		const GOLDEN_ANGLE = 2.39996323;
		const points64 = new Float32Array(128);
		const points16 = new Float32Array(32);

		let i64 = 0, i16 = 0;

		for(let i = 0; i < 80; ++i) {

			const theta = i * GOLDEN_ANGLE;
			const r = Math.sqrt(i) / Math.sqrt(80);
			const u = r * Math.cos(theta), v = r * Math.sin(theta);

			if(i % 5 === 0) {

				points16[i16++] = u;
				points16[i16++] = v;

			} else {

				points64[i64++] = u;
				points64[i64++] = v;

			}

		}

		// Pack points into vec4 instances to reduce the uniform count.
		const kernel64 = [];
		const kernel16 = [];

		for(let i = 0; i < 128;) {

			kernel64.push(new Vector4(
				points64[i++], points64[i++],
				points64[i++], points64[i++]
			));

		}

		for(let i = 0; i < 32;) {

			kernel16.push(new Vector4(
				points16[i++], points16[i++],
				points16[i++], points16[i++]
			));

		}

		this.uniforms.kernel64.value = kernel64;
		this.uniforms.kernel16.value = kernel16;

	}

	/**
	 * Sets the texel size.
	 *
	 * @deprecated Use setSize() instead.
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

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
