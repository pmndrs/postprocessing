import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A convolution blur shader material.
 *
 * Use this shader five times in a row while adjusting the kernel 
 * before each render call in order to get the same result as with 
 * a 35x35 Gauss filter.
 *
 * Implementation based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
 * Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
 *
 * Further modified according to:
 *  https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/BestPracticesforShaders/BestPracticesforShaders.html#//apple_ref/doc/uid/TP40008793-CH7-SW15
 *
 * @class ConvolutionMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class ConvolutionMaterial extends THREE.ShaderMaterial {

	constructor(texelSize) {

		super({

			uniforms: {

				tDiffuse: {type: "t", value: null},
				texelSize: {type: "v2", value: new THREE.Vector2()},
				halfTexelSize: {type: "v2", value: new THREE.Vector2()},
				kernel: {type: "f", value: 0.0}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

		/**
		 * The Kawase blur kernels for five consecutive convolution passes.
		 * The result matches the 35x35 Gauss filter.
		 *
		 * @property kernels
		 * @type Number
		 * @private
		 */

		this.kernels = new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]);

		/**
		 * Scales the kernels.
		 *
		 * @property scale
		 * @type Number
		 * @default 1.0
		 */

		this.scale = 1.0;

		/**
		 * The current kernel.
		 *
		 * @property currentKernel
		 * @type Number
		 * @private
		 */

		this.currentKernel = 0;

		if(texelSize !== undefined) { this.setTexelSize(texelSize.x, texelSize.y); }

	}

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

	/**
	 * Adjusts the kernel for the next blur pass.
	 * Call this method before each render iteration.
	 *
	 * @method adjustKernel
	 */

	adjustKernel() {

		this.uniforms.kernel.value = this.kernels[this.currentKernel] * this.scale;
		if(++this.currentKernel >= this.kernels.length) { this.currentKernel = 0; }

	}

}
