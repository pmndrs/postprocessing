import { CopyMaterial, ConvolutionMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

// A constant blur spread factor.
var BLUR = 0.001953125;

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
 * @param {Object} [options] - The options.
 * @param {Number} [options.strength=1.0] - The bloom strength.
 * @param {Number} [options.kernelSize=25] - The kernel size.
 * @param {Number} [options.sigma=4.0] - The sigma value.
 * @param {Number} [options.resolutionScale=0.25] - The render resolution scale, relative to the on-screen render size.
 */

export function BloomPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }

	var kernelSize = (options.kernelSize !== undefined) ? options.kernelSize : 25;

	/**
	 * The resolution scale.
	 *
	 * @property resolutionScale
	 * @type Number
	 * @private
	 */

	this.resolutionScale = (options.resolution === undefined) ? 0.25 : THREE.Math.clamp(options.resolution, 0.0, 1.0);

	/**
	 * The horizontal blur factor.
	 *
	 * @property blurX
	 * @type Vector2
	 * @private
	 */

	this.blurX = new THREE.Vector2(BLUR, 0.0);

	/**
	 * The vertical blur factor.
	 *
	 * @property blurY
	 * @type Vector2
	 * @private
	 */

	this.blurY = new THREE.Vector2();

	/**
	 * A render target.
	 *
	 * @property renderTargetX
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetX = new THREE.WebGLRenderTarget(1, 1, {
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

	if(options.strength !== undefined) { this.copyMaterial.uniforms.opacity.value = options.strength; }

	/**
	 * Convolution shader material.
	 *
	 * @property convolutionMaterial
	 * @type ConvolutionMaterial
	 * @private
	 */

	this.convolutionMaterial = new ConvolutionMaterial();

	this.convolutionMaterial.buildKernel((options.sigma !== undefined) ? options.sigma : 4.0);
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
	this.convolutionMaterial.uniforms.uImageIncrement.value.copy(this.blurX);
	renderer.render(this.scene, this.camera, this.renderTargetX, true);

	// Render quad with blurred scene into texture (convolution pass 2).
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	this.convolutionMaterial.uniforms.uImageIncrement.value.copy(this.blurY);
	renderer.render(this.scene, this.camera, this.renderTargetY, true);

	// Render original scene with superimposed blur (-> onto readBuffer).
	this.quad.material = this.copyMaterial;
	this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

	if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

	renderer.render(this.scene, this.camera, readBuffer, this.clear);

};

/**
 * Updates this pass with the main render size.
 *
 * @method updateRenderSize
 * @param {Number} w - The on-screen render width.
 * @param {Number} h - The on-screen render height.
 */

BloomPass.prototype.updateRenderSize = function(w, h) {

	this.renderTargetX.setSize(Math.floor(w * this.resolutionScale), Math.floor(h * this.resolutionScale));

	if(this.renderTargetX.width <= 0) { this.renderTargetX.width = 1; }
	if(this.renderTargetX.height <= 0) { this.renderTargetX.height = 1; }

	this.renderTargetY.setSize(this.renderTargetX.width, this.renderTargetX.height);

	// Scale the factor with the render target ratio.
	this.blurY.set(0.0, (w / h) * BLUR);

};
