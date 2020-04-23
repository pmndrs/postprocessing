import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/bokeh/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A bokeh blur material.
 *
 * This material should be applied twice in a row, with `fill` mode enabled for
 * the second pass.
 *
 * Enabling the `foreground` option causes the shader to combine the near and
 * far CoC values around foreground objects.
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

			type: "BokehMaterial",

			defines: {
				PASS: fill ? "2" : "1"
			},

			uniforms: {
				kernel64: new Uniform(new Float32Array(128)),
				kernel16: new Uniform(new Float32Array(32)),
				inputBuffer: new Uniform(null),
				cocBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				scale: new Uniform(1.0)
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

		/** @ignore */
		this.toneMapped = false;

		if(foreground) {

			this.defines.FOREGROUND = "1";

		}

		this.generateKernel();

	}

	/**
	 * Generates the blur kernels; one big one and a small one for highlights.
	 *
	 * @private
	 */

	generateKernel() {

		const GOLDEN_ANGLE = 2.39996323;
		const points64 = this.uniforms.kernel64.value;
		const points16 = this.uniforms.kernel16.value;

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

	}

	/**
	 * Sets the texel size.
	 *
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

	}

}
