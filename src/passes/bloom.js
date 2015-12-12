import { CopyMaterial, ConvolutionMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

// Blur constants.
var BLUR_X = new THREE.Vector2(0.001953125, 0.0);
var BLUR_Y = new THREE.Vector2(0.0, 0.001953125);

/**
 * A bloom pass.
 *
 * This pass renders a scene with superimposed blur 
 * by utilising an approximated gauss kernel.
 *
 * Since the effect will be written to the readBuffer 
 * render texture, you'll need to use a ShaderPass with 
 * a CopyMaterial to render the texture to screen.
 *
 * @class BloomPass
 * @constructor
 * @extends Pass
 * @param {Number} [strength=1.0] - The bloom strength.
 * @param {Number} [kernelSize=25] - The kernel size.
 * @param {Number} [sigma=4.0] - The sigma value.
 * @param {Number} [resolution=256] - The render resolution.
 */

export function BloomPass(strength, kernelSize, sigma, resolution) {

	Pass.call(this);

	// Defaults.
	kernelSize = (kernelSize !== undefined) ? kernelSize : 25;
	sigma = (sigma !== undefined) ? sigma : 4.0;
	resolution = (resolution !== undefined) ? resolution : 256;

	/**
	 * A render target.
	 *
	 * @property renderTargetX
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetX = new THREE.WebGLRenderTarget(resolution, resolution, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	});

	/**
	 * A second render target.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetY = this.renderTargetX.clone();

	/**
	 * Copy shader material.
	 *
	 * @property copyMaterial
	 * @type CopyMaterial
	 * @private
	 */

	this.copyMaterial = new CopyMaterial();
	this.copyMaterial.blending = THREE.AdditiveBlending;
	this.copyMaterial.transparent = true;

	if(strength !== undefined) { this.copyMaterial.uniforms.opacity.value = strength; }

	/**
	 * Convolution shader material.
	 *
	 * @property convolutionMaterial
	 * @type ConvolutionMaterial
	 * @private
	 */

	this.convolutionMaterial = new ConvolutionMaterial();
	this.convolutionMaterial.uniforms.uImageIncrement.value = BLUR_X;
	this.convolutionMaterial.buildKernel(sigma);
	this.convolutionMaterial.defines.KERNEL_SIZE_FLOAT = kernelSize.toFixed(1);
	this.convolutionMaterial.defines.KERNEL_SIZE_INT = kernelSize.toFixed(0);

	/**
	 * Clear flag. If set to true, the blurring will occur.
	 *
	 * @property clear
	 * @type Boolean
	 * @default true
	 */

	this.clear = false;

	/**
	 * The quad mesh to render.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

}

BloomPass.prototype = Object.create(Pass.prototype);
BloomPass.prototype.constructor = BloomPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 * @param {Boolean} maskActive - Disable stencil test.
 */

BloomPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

	if(maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST); }

	// Render quad with blurred scene into texture (convolution pass 1).
	this.quad.material = this.convolutionMaterial;
	this.convolutionMaterial.uniforms.tDiffuse.value = readBuffer;
	this.convolutionMaterial.uniforms.uImageIncrement.value = BLUR_X;

	renderer.render(this.scene, this.camera, this.renderTargetX, true);

	// Render quad with blurred scene into texture (convolution pass 2).
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	this.convolutionMaterial.uniforms.uImageIncrement.value = BLUR_Y;

	renderer.render(this.scene, this.camera, this.renderTargetY, true);

	// Render original scene with superimposed blur (-> into readBuffer).
	this.quad.material = this.copyMaterial;
	this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

	if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

	renderer.render(this.scene, this.camera, readBuffer, this.clear);

};
