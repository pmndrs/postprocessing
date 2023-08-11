import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { Resizable } from "../core/Resizable.js";

import fragmentShader from "./shaders/convolution.bokeh.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A bokeh disc blur material.
 *
 * This material should be applied twice in a row, with `fill` mode enabled for the second pass. Enabling the
 * `foreground` option causes the shader to combine the near and far CoC values around foreground objects.
 *
 * @group Materials
 */

export class BokehMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new bokeh material.
	 *
	 * @param fill - Enables or disables the bokeh highlight fill mode.
	 * @param foreground - Determines whether this material will be applied to foreground colors.
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
				kernel64: new Uniform(null),
				kernel16: new Uniform(null),
				scale: new Uniform(1.0)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		if(foreground) {

			this.defines.FOREGROUND = "1";

		}

		this.generateKernel();

	}

	/**
	 * The input buffer.
	 */

	set inputBuffer(value: Texture) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The circle of confusion buffer.
	 */

	set cocBuffer(value: Texture) {

		this.uniforms.cocBuffer.value = value;

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
	 * Generates the blur kernel.
	 */

	private generateKernel(): void {

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

		// The points are packed into vec4 instances to minimize the uniform count.
		this.uniforms.kernel64.value = points64;
		this.uniforms.kernel16.value = points16;

	}

	setSize(width: number, height: number): void {

		const texelSize = this.uniforms.texelSize.value as Vector2;
		texelSize.set(1.0 / width, 1.0 / height);

	}

}
