import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * An optimised convolution shader material.
 *
 * Based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
 *  Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
 * and an article by Filip Strugar, Intel:
 *  An investigation of fast real-time GPU-based image blur algorithms
 *
 * Further modified according to:
 *  https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/BestPracticesforShaders/BestPracticesforShaders.html#//apple_ref/doc/uid/TP40008793-CH7-SW15
 *
 * @class ConvolutionMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class ConvolutionMaterial extends ShaderMaterial {

	constructor(texelSize = new Vector2()) {

		super({

			type: "ConvolutionMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				halfTexelSize: new Uniform(new Vector2()),
				kernel: new Uniform(0.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setTexelSize(texelSize.x, texelSize.y);

		/**
		 * The current kernel size.
		 *
		 * @property kernelSize
		 * @type KernelSize
		 * @default KernelSize.LARGE
		 */

		this.kernelSize = KernelSize.LARGE;

	}

	/**
	 * Returns the kernel.
	 *
	 * @method getKernel
	 * @return {Float32Array} The kernel.
	 */

	getKernel() { return kernelPresets[this.kernelSize]; }

	/**
	 * Sets the texel size.
	 *
	 * @method setTexelSize
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);
		this.uniforms.halfTexelSize.value.set(x, y).multiplyScalar(0.5);

	}

}

/**
 * The Kawase blur kernel presets.
 *
 * @property kernelPresets
 * @type Array
 * @private
 * @static
 */

const kernelPresets = [
	new Float32Array([0.0, 0.0]),
	new Float32Array([0.0, 1.0, 1.0]),
	new Float32Array([0.0, 1.0, 1.0, 2.0]),
	new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])
];

/**
 * A kernel size enumeration.
 *
 * @class KernelSize
 * @submodule materials
 * @static
 */

export const KernelSize = {

	/**
	 * A very small kernel that matches a 7x7 Gauss blur kernel.
	 *
	 * @property VERY_SMALL
	 * @type Number
	 * @static
	 */

	VERY_SMALL: 0,

	/**
	 * A small kernel that matches a 15x15 Gauss blur kernel.
	 *
	 * @property SMALL
	 * @type Number
	 * @static
	 */

	SMALL: 1,

	/**
	 * A medium sized kernel that matches a 23x23 Gauss blur kernel.
	 *
	 * @property MEDIUM
	 * @type Number
	 * @static
	 */

	MEDIUM: 2,

	/**
	 * A large kernel that matches a 35x35 Gauss blur kernel.
	 *
	 * @property LARGE
	 * @type Number
	 * @static
	 */

	LARGE: 3,

	/**
	 * A very large kernel that matches a 63x63 Gauss blur kernel.
	 *
	 * @property VERY_LARGE
	 * @type Number
	 * @static
	 */

	VERY_LARGE: 4,

	/**
	 * A huge kernel that matches a 127x127 Gauss blur kernel.
	 *
	 * @property HUGE
	 * @type Number
	 * @static
	 */

	HUGE: 5

};
