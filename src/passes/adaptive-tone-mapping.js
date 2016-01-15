import {
	CopyMaterial,
	LuminosityMaterial,
	AdaptiveLuminosityMaterial,
	ToneMappingMaterial
} from "../materials";

import { Pass } from "./pass";
import THREE from "three";

/**
 * Generates a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 *
 * @class AdaptiveToneMappingPass
 * @constructor
 * @extends Pass
 * @param {Boolean} adaptive - Adaptivity flag.
 * @param {Number} [opacity] - The resolution.
 */

export function AdaptiveToneMappingPass(adaptive, resolution) {

	Pass.call(this);

	/**
	 * Render resolution.
	 *
	 * @property adaptive
	 * @type Number
	 * @default 256
	 */

	this.resolution = (resolution !== undefined) ? resolution : 256;

	/**
	 * Adaptivity flag.
	 *
	 * @property adaptive
	 * @type Boolean
	 * @default false
	 */

	this.adaptive = (adaptive !== undefined) ? false : true;

	/**
	 * Initialisation flag.
	 *
	 * @property needsInit
	 * @type Boolean
	 * @default true
	 */

	this.needsInit = true;

	/**
	 * Luminance render target.
	 *
	 * @property luminanceRT
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.luminanceRT = null;

	/**
	 * Previous luminance render target.
	 *
	 * @property previousLuminanceRT
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.previousLuminanceRT = null;

	/**
	 * Current luminance render target.
	 *
	 * @property currentLuminanceRT
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.currentLuminanceRT = null;

	/**
	 * Copy shader material.
	 *
	 * @property materialCopy
	 * @type CopyMaterial
	 * @private
	 */

	this.materialCopy = new CopyMaterial();
	this.materialCopy.blending = THREE.NoBlending;
	this.materialCopy.depthTest = false;

	/**
	 * Luminance shader material.
	 *
	 * @property materialLuminance
	 * @type LuminosityMaterial
	 * @private
	 */

	this.materialLuminance = new LuminosityMaterial();
	this.materialLuminance.blending = THREE.NoBlending;

	/**
	 * Adaptive luminance shader material.
	 *
	 * @property materialAdaptiveLuminosity
	 * @type AdaptiveLuminosityMaterial
	 * @private
	 */

	this.materialAdaptiveLuminosity = new AdaptiveLuminosityMaterial();
	this.materialAdaptiveLuminosity.defines.MIP_LEVEL_1X1 = (Math.log(this.resolution) / Math.log(2.0)).toFixed(1);
	this.materialAdaptiveLuminosity.blending = THREE.NoBlending;

	/**
	 * Tone mapping shader material.
	 *
	 * @property materialToneMapping
	 * @type ToneMappingMaterial
	 * @private
	 */

	this.materialToneMapping = new ToneMappingMaterial();
	this.materialToneMapping.blending = THREE.NoBlending;

	// Swap the render targets in this pass.
	this.needsSwap = true;

	/**
	 * The quad mesh to use for rendering the 2D effect.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

}

AdaptiveToneMappingPass.prototype = Object.create(Pass.prototype);
AdaptiveToneMappingPass.prototype.constructor = AdaptiveToneMappingPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

AdaptiveToneMappingPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	if(this.needsInit) {

		this.reset(renderer);
		this.luminanceRT.texture.type = readBuffer.texture.type;
		this.previousLuminanceRT.texture.type = readBuffer.texture.type;
		this.currentLuminanceRT.texture.type = readBuffer.texture.type;
		this.needsInit = false;

	}

	if(this.adaptive) {

		// Render the luminance of the current scene into a render target with mipmapping enabled.
		this.quad.material = this.materialLuminance;
		this.materialLuminance.uniforms.tDiffuse.value = readBuffer;
		renderer.render(this.scene, this.camera, this.currentLuminanceRT);

		// Use the new luminance values, the previous luminance and the frame delta to adapt the luminance over time.
		this.quad.material = this.materialAdaptiveLuminosity;
		this.materialAdaptiveLuminosity.uniforms.delta.value = delta;
		this.materialAdaptiveLuminosity.uniforms.lastLum.value = this.previousLuminanceRT;
		this.materialAdaptiveLuminosity.uniforms.currentLum.value = this.currentLuminanceRT;
		renderer.render(this.scene, this.camera, this.luminanceRT);

		// Copy the new adapted luminance value so that it can be used by the next frame.
		this.quad.material = this.materialCopy;
		this.materialCopy.uniforms.tDiffuse.value = this.luminanceRT;
		renderer.render(this.scene, this.camera, this.previousLuminanceRT);

	}

	this.quad.material = this.materialToneMapping;
	this.materialToneMapping.uniforms.tDiffuse.value = readBuffer;
	renderer.render(this.scene, this.camera, writeBuffer, this.clear);

};

/**
 * Resets this pass.
 *
 * @method reset
 * @param {WebGLRender} renderer - The renderer to use.
 * @private
 */

AdaptiveToneMappingPass.prototype.reset = function(renderer) {

	// Create new render targets.
	if(this.luminanceRT !== null) { this.luminanceRT.dispose(); }
	if(this.currentLuminanceRT !== null) { this.currentLuminanceRT.dispose(); }
	if(this.previousLuminanceRT !== null) { this.previousLuminanceRT.dispose(); }

	var pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat};

	this.luminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
	this.luminanceRT.texture.generateMipmaps = false;
	this.previousLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);
	this.previousLuminanceRT.texture.generateMipmaps = false;

	// Only mipmap the current luminosity. A down-sampled version is desired in the adaptive shader.
	pars.minFilter = THREE.LinearMipMapLinearFilter;
	this.currentLuminanceRT = new THREE.WebGLRenderTarget(this.resolution, this.resolution, pars);//change filter then?

	if(this.adaptive) {

		this.materialToneMapping.defines.ADAPTED_LUMINANCE = 1;
		this.materialToneMapping.uniforms.luminanceMap.value = this.luminanceRT;

	}

	//Put something in the adaptive luminance texture so that the scene can render initially.
	this.quad.material = new THREE.MeshBasicMaterial({color: 0x777777});
	this.materialLuminance.needsUpdate = true;
	this.materialAdaptiveLuminosity.needsUpdate = true;
	this.materialToneMapping.needsUpdate = true;
	// renderer.render(this.scene, this.camera, this.luminanceRT);
	// renderer.render(this.scene, this.camera, this.previousLuminanceRT);
	// renderer.render(this.scene, this.camera, this.currentLuminanceRT);

};

/**
 * Sets whether this pass uses adaptive luminosity.
 *
 * @method setAdaptive
 * @param {Boolean} adaptive - Adaptivity flag.
 */

AdaptiveToneMappingPass.prototype.setAdaptive = function( adaptive ) {

	if(adaptive) {

		this.adaptive = true;
		this.materialToneMapping.defines.ADAPTED_LUMINANCE = 1;
		this.materialToneMapping.uniforms.luminanceMap.value = this.luminanceRT;

	} else {

		this.adaptive = false;
		delete this.materialToneMapping.defines.ADAPTED_LUMINANCE;
		this.materialToneMapping.uniforms.luminanceMap.value = undefined;

	}

	this.materialToneMapping.needsUpdate = true;

};

/**
 * Sets the adaption rate (tau) for the adaptive luminosity.
 *
 * @method setAdaptionRate
 * @param {Number} tau - The new rate.
 */

AdaptiveToneMappingPass.prototype.setAdaptionRate = function(tau) {

	if(tau !== undefined) {

		this.materialAdaptiveLuminosity.uniforms.tau.value = Math.abs(tau);

	}

};

/**
 * Sets the maximum luminosity value for the adaptive luminosity.
 *
 * @method setMaxLuminance
 * @param {Number} maxLum - The new maximum luminosity.
 */

AdaptiveToneMappingPass.prototype.setMaxLuminance = function(maxLum) {

	if(maxLum !== undefined) {

		this.materialToneMapping.uniforms.maxLuminance.value = maxLum;

	}

};

/**
 * Sets the average luminance value for tone-mapping.
 *
 * @method setAverageLuminance
 * @param {Number} avgLum - The new average.
 */

AdaptiveToneMappingPass.prototype.setAverageLuminance = function(avgLum) {

	if(avgLum !== undefined) {

		this.materialToneMapping.uniforms.averageLuminance.value = avgLum;

	}

};

/**
 * Sets the middle grey value for tone-mapping.
 *
 * @method setMiddleGrey
 * @param {Number} middleGrey - The new middle grey value.
 */

AdaptiveToneMappingPass.prototype.setMiddleGrey = function(middleGrey) {

	if(middleGrey !== undefined) {

		this.materialToneMapping.uniforms.middleGrey.value = middleGrey;

	}

};

/**
 * Deletes all render targets and materials.
 *
 * @method dispose
 */

AdaptiveToneMappingPass.prototype.dispose = function() {

	if(this.luminanceRT) { this.luminanceRT.dispose(); }
	if(this.previousLuminanceRT) { this.previousLuminanceRT.dispose(); }
	if(this.currentLuminanceRT) { this.currentLuminanceRT.dispose(); }
	if(this.materialLuminance) { this.materialLuminance.dispose(); }
	if(this.materialAdaptiveLuminosity) { this.materialAdaptiveLuminosity.dispose(); }
	if(this.materialCopy) { this.materialCopy.dispose(); }
	if(this.materialToneMapping) { this.materialToneMapping.dispose(); }

};
