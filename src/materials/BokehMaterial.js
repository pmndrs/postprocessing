import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

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
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The circle of confusion buffer.
	 *
	 * @type {Texture}
	 */

	set cocBuffer(value) {

		this.uniforms.cocBuffer.value = value;

	}

	/**
	 * Sets the circle of confusion buffer.
	 *
	 * @deprecated Use cocBuffer instead.
	 * @param {Texture} value - The buffer.
	 */

	setCoCBuffer(value) {

		this.uniforms.cocBuffer.value = value;

	}

	/**
	 * The blur scale.
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
	 * Returns the blur scale.
	 *
	 * @deprecated Use scale instead.
	 * @return {Number} The scale.
	 */

	getScale(value) {

		return this.uniforms.scale.value = value;

	}

	/**
	 * Sets the blur scale.
	 *
	 * @deprecated Use scale instead.
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
		const points64 = new Float64Array(128);
		const points16 = new Float64Array(32);

		let i64 = 0, i16 = 0;

		for(let i = 0, sqrt80 = Math.sqrt(80); i < 80; ++i) {

			const theta = i * GOLDEN_ANGLE;
			const r = Math.sqrt(i) / sqrt80;
			const u = r * Math.cos(theta), v = r * Math.sin(theta);

			if(i % 5 === 0) {

				points16[i16++] = u;
				points16[i16++] = v;

			} else {

				points64[i64++] = u;
				points64[i64++] = v;

			}

		}

		// The kernel data is injected as const arrays to avoid uniform count limitations.
		let kernelData = `const float kernel64[${points64.length}] = float[${points64.length}](\n\t`;
		kernelData += Array.from(points64).map(v => v.toFixed(16)).join(",\n\t");
		kernelData += `\n);\n\nconst float kernel16[${points16.length}] = float[${points16.length}](\n\t`;
		kernelData += Array.from(points16).map(v => v.toFixed(16)).join(",\n\t");
		this.fragmentShader = kernelData + "\n);\n\n" + fragmentShader;

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
