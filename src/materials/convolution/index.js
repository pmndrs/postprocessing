import shader from "./inlined/shader";
import THREE from "three";

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
 * @param {Vector2} texelSize - The absolute screen texel size.
 */

export function ConvolutionMaterial(texelSize) {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null},
			texelSize: {type: "v2", value: new THREE.Vector2()},
			halfTexelSize: {type: "v2", value: new THREE.Vector2()},
			kernel: {type: "f", value: 0.0}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

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
	 * @property blurriness
	 * @type Number
	 * @default 1.0
	 */

	this.blurriness = 1.0;

	/**
	 * The current kernel.
	 *
	 * @property i
	 * @type Number
	 * @private
	 */

	this.i = 0;

	// Set the texel size if already provided.
	this.setTexelSize(texelSize);

}

ConvolutionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
ConvolutionMaterial.prototype.constructor = ConvolutionMaterial;

/**
 * Sets the texel size.
 *
 * @method setTexelSize
 * @param {Vector2} texelSize - The new texel size.
 */

ConvolutionMaterial.prototype.setTexelSize = function(texelSize) {

	if(texelSize !== undefined) {

		this.uniforms.texelSize.value.copy(texelSize);
		this.uniforms.halfTexelSize.value.copy(texelSize).multiplyScalar(0.5);

	}

};

/**
 * Adjusts the kernel for the next blur pass.
 * Call this method before each render iteration.
 *
 * @method adjustKernel
 */

ConvolutionMaterial.prototype.adjustKernel = function() {

	this.uniforms.kernel.value = this.kernels[this.i] * this.blurriness;
	if(++this.i >= this.kernels.length) { this.i = 0; }

};
