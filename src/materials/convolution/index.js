import shader from "./inlined/shader";
import THREE from "three";

/**
 * Gauss kernel.
 *
 * Dropped [ sqrt(2 * pi) * sigma ] term (unnecessary when normalizing).
 *
 * @method gauss
 * @param {Number} x - X.
 * @param {Number} sigma - Sigma.
 * @private
 * @static
 */

function gauss(x, sigma) { return Math.exp(-(x * x) / (2.0 * sigma * sigma)); }

/**
 * A convolution shader material.
 *
 * @class ConvolutionMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function ConvolutionMaterial() {

	THREE.ShaderMaterial.call(this, {

		defines: {

			KERNEL_SIZE_FLOAT: "25.0",
			KERNEL_SIZE_INT: "25"

		},

		uniforms: {

			tDiffuse: {type: "t", value: null},
			uImageIncrement: {type: "v2", value: new THREE.Vector2(0.001953125, 0.0)},
			cKernel: {type: "fv1", value: []}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex,

	});

}

ConvolutionMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
ConvolutionMaterial.prototype.constructor = ConvolutionMaterial;

/**
 * Creates a new kernel for this material.
 *
 * @param {Number} sigma - Sigma value.
 * @private
 */

ConvolutionMaterial.prototype.buildKernel = function(sigma) {

	var i, values, sum, halfWidth;
	var kMaxKernelSize = 25;
	var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;

	if(kernelSize > kMaxKernelSize) { kernelSize = kMaxKernelSize; }

	halfWidth = (kernelSize - 1) * 0.5;
	values = this.uniforms.cKernel.value;
	values.length = 0;
	sum = 0.0;

	for(i = 0; i < kernelSize; ++i) {

		values[i] = gauss(i - halfWidth, sigma);
		sum += values[i];

	}

	// Normalize the kernel.
	for(i = 0; i < kernelSize; ++i) { values[i] /= sum; }

};
