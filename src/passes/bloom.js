import {
	CopyMaterial,
	CombineMaterial,
	LuminosityMaterial,
	ConvolutionMaterial
} from "../materials";

import { Pass } from "./pass";
import THREE from "three";

/**
 * A bloom pass.
 *
 * This pass renders a scene with superimposed blur 
 * by utilising the fast Kawase convolution approach.
 *
 * @class BloomPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
 * @param {Number} [options.blurriness=1.0] - The scale of the blur kernels.
 * @param {Number} [options.strength=1.0] - The bloom strength.
 * @param {Number} [options.distinction=1.0] - The luminance distinction factor. Raise this value to bring out the brighter elements in the scene.
 */

export function BloomPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }

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
		format: THREE.RGBFormat,
		stencilBuffer: false,
		depthBuffer: false
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

	/**
	 * The resolution scale.
	 *
	 * You need to call the reset method of the EffectComposer after 
	 * changing this value.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

	/**
	 * The texel size for the blur.
	 *
	 * @property texelSize
	 * @type Vector2
	 * @private
	 */

	this.texelSize = new THREE.Vector2();

	/**
	 * Combine shader material.
	 *
	 * @property combineMaterial
	 * @type CombineMaterial
	 * @private
	 */

	this.combineMaterial = new CombineMaterial();

	if(options.strength !== undefined) { this.combineMaterial.uniforms.opacity2.value = options.strength; }

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
	 * Luminance shader material.
	 *
	 * @property luminosityMaterial
	 * @type LuminosityMaterial
	 * @private
	 */

	this.luminosityMaterial = new LuminosityMaterial(true);

	/**
	 * Convolution shader material.
	 *
	 * @property convolutionMaterial
	 * @type ConvolutionMaterial
	 * @private
	 */

	this.convolutionMaterial = new ConvolutionMaterial();

	// Set the blur strength.
	this.blurriness = options.blurriness;

}

BloomPass.prototype = Object.create(Pass.prototype);
BloomPass.prototype.constructor = BloomPass;

/**
 * The strength of the preliminary blur phase.
 *
 * @property blurriness
 * @type Number
 * @default 1.0
 */

Object.defineProperty(BloomPass.prototype, "blurriness", {

	get: function() { return this.convolutionMaterial.blurriness; },

	set: function(x) {

		if(typeof x === "number") {

			this.convolutionMaterial.blurriness = x;

		}

	}

});

/**
 * Renders the bloom effect.
 *
 * Applies a tone-mapping pass and convolution blur to the readBuffer and 
 * renders the result into a seperate render target. The result is additively 
 * blended with the readBuffer.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} buffer - The read/write buffer.
 * @param {Number} delta - The render delta time.
 * @param {Boolean} maskActive - Disable stencil test.
 */

BloomPass.prototype.render = function(renderer, buffer, delta, maskActive) {

	if(maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST); }

	// Luminance threshold.
	this.quad.material = this.luminosityMaterial;
	this.luminosityMaterial.uniforms.tDiffuse.value = buffer;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	// Convolution blur (5 passes).
	this.quad.material = this.convolutionMaterial;

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	if(maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

	// Render original scene with superimposed blur.
	if(this.renderToScreen) {

		this.quad.material = this.combineMaterial;
		this.combineMaterial.uniforms.texture1.value = buffer;
		this.combineMaterial.uniforms.texture2.value = this.renderTargetY;

		renderer.render(this.scene, this.camera);

	} else {

		this.quad.material = this.copyMaterial;
		this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY;

		renderer.render(this.scene, this.camera, buffer, false);

	}

};

/**
 * Updates this pass with the main render target's size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

BloomPass.prototype.setSize = function(width, height) {

	width = Math.floor(width * this.resolutionScale);
	height = Math.floor(height * this.resolutionScale);

	if(width <= 0) { width = 1; }
	if(height <= 0) { height = 1; }

	this.renderTargetX.setSize(width, height);
	this.renderTargetY.setSize(width, height);

	this.texelSize.set(1.0 / width, 1.0 / height);
	this.convolutionMaterial.setTexelSize(this.texelSize);

};
