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
 * @param {Number} [options.resolution=256] - The render resolution.
 */

export function BloomPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }
	if(options.kernelSize === undefined) { options.kernelSize = 25; }

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

	this.renderTargetX.texture.generateMipmaps = false;

	/**
	 * Another render target.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetY = this.renderTargetX.clone();
	this.renderTargetY.texture.generateMipmaps = false;

	// Set the resolution.
	this.resolution = (options.resolution === undefined) ? 256 : options.resolution;

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

	this.blurY = new THREE.Vector2(0.0, BLUR);

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
	this.convolutionMaterial.defines.KERNEL_SIZE_FLOAT = options.kernelSize.toFixed(1);
	this.convolutionMaterial.defines.KERNEL_SIZE_INT = options.kernelSize.toFixed(0);

	/**
	 * Clear flag.
	 *
	 * This pass draws the blurred scene over the normal one.
	 * Set to true to see the fully blurred scene.
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
 * The resolution of the render targets. Needs to be a power of 2.
 *
 * @property resolution
 * @type Number
 */

Object.defineProperty(BloomPass.prototype, "resolution", {

	get: function() { return this.renderTargetX.width; },

	set: function(x) {

		if(typeof x === "number") {

			if(x <= 0) { x = 1; }

			this.renderTargetX.setSize(x, x);
			this.renderTargetY.setSize(x, x);

		}

	}

});

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
 * Updates this pass with the main render target's size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

BloomPass.prototype.setSize = function(width, height) {

	// Scale one of the blur factors with the render target ratio.
	this.blurY.set(0.0, (width / height) * BLUR);

};
