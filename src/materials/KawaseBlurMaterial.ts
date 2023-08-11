import { NoBlending, ShaderMaterial, Texture, Uniform, Vector4 } from "three";
import { Resizable } from "../core/Resizable.js";
import { KernelSize } from "../enums/KernelSize.js";

import fragmentShader from "./shaders/convolution.kawase.frag";
import vertexShader from "./shaders/convolution.kawase.vert";

const kernelPresets = [
	new Float32Array([0.0, 0.0]),
	new Float32Array([0.0, 1.0, 1.0]),
	new Float32Array([0.0, 1.0, 1.0, 2.0]),
	new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])
];

/**
 * An optimized blur shader material.
 *
 * Based on "Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)" by Masaki Kawase, Bunkasha Games,
 * GDC2003 and "An investigation of fast real-time GPU-based image blur algorithms" by Filip Strugar, Intel, 2014.
 *
 * @see https://genderi.org/frame-buffer-postprocessing-effects-in-double-s-t-e-a-l-wreckl.html
 * @see https://www.intel.com/content/www/us/en/developer/articles/technical/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms.html
 * @group Materials
 */

export class KawaseBlurMaterial extends ShaderMaterial implements Resizable {

	/**
	 * The kernel size.
	 */

	kernelSize: KernelSize;

	/**
	 * Constructs a new blur material.
	 */

	constructor() {

		super({
			name: "KawaseBlurMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector4()),
				scale: new Uniform(1.0),
				kernel: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.kernelSize = KernelSize.MEDIUM;

	}

	/**
	 * The input buffer.
	 */

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The kernel sequence for the current kernel size. Can be used to configure the {@link kernel}.
	 */

	get kernelSequence(): Float32Array {

		return kernelPresets[this.kernelSize];

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
	 * The current kernel. Can be configured using the {@link kernelSequence}.
	 */

	get kernel(): number {

		return this.uniforms.kernel.value as number;

	}

	set kernel(value: number) {

		this.uniforms.kernel.value = value;

	}

	setSize(width: number, height: number): void {

		const x = 1.0 / width, y = 1.0 / height;
		const texelSize = this.uniforms.texelSize.value as Vector4;
		texelSize.set(x, y, x * 0.5, y * 0.5);

	}

}
