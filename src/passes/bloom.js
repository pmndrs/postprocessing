import { CopyMaterial, ConvolutionMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

// Blur constants.
var blurX = new THREE.Vector2(0.001953125, 0.0);
var blurY = new THREE.Vector2(0.0, 0.001953125);

/**
 * A bloom pass.
 *
 * @class BloomPass
 * @constructor
 * @extends Pass
 * @param {Number} strength - The bloom strength.
 * @param {Number} kernelSize - The kernel size.
 * @param {Number} sigma - The sigma value.
 * @param {Number} resolution - The render resolution.
 */

export function BloomPass(strength, kernelSize, sigma, resolution) {

	Pass.call(this, new THREE.Scene(), new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));

	// Defaults.
	strength = (strength !== undefined) ? strength : 1;
	kernelSize = (kernelSize !== undefined) ? kernelSize : 25;
	sigma = (sigma !== undefined) ? sigma : 4.0;
	resolution = (resolution !== undefined) ? resolution : 256;

	/**
	 * A render target.
	 *
	 * @property renderTargetX
	 * @type {WebGLRenderTarget}
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
	 * @type {WebGLRenderTarget}
	 */

	this.renderTargetY = this.renderTargetX.clone();

	/**
	 * Copy shader material.
	 *
	 * @property copyMaterial
	 * @type {CopyMaterial}
	 * @private
	 */

	this.copyMaterial = new CopyMaterial();
	this.copyMaterial.uniforms.opacity.value = strength;
	this.copyMaterial.transparent = true;

	/**
	 * Convolution shader material.
	 *
	 * @property convolutionMaterial
	 * @type {ConvolutionMaterial}
	 * @private
	 */

	this.convolutionMaterial = new ConvolutionMaterial();
	this.convolutionMaterial.uniforms.uImageIncrement.value = blurX;
	this.convolutionMaterial.buildKernel(sigma);
	this.convolutionMaterial.defines.KERNEL_SIZE_FLOAT = kernelSize.toFixed(1);
	this.convolutionMaterial.defines.KERNEL_SIZE_INT = kernelSize.toFixed(0);

	// Don't clear in this pass.
	this.clear = false;

	/**
	 * The quad mesh to render.
	 *
	 * @property quad
	 * @type {Mesh}
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
	this.convolutionMaterial.uniforms.uImageIncrement.value = blurX;

	renderer.render(this.scene, this.camera, this.renderTargetX, true);

	// Render quad with blurred scene into texture (convolution pass 2).
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	this.convolutionMaterial.uniforms.uImageIncrement.value = blurY;

	renderer.render(this.scene, this.camera, this.renderTargetY, true);

	// Render original scene with superimposed blur to texture.
	this.quad.material = this.copyMaterial;
	this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

	if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

	renderer.render(this.scene, this.camera, readBuffer, this.clear);

};
