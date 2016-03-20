import {
	AdaptiveLuminosityMaterial,
	CopyMaterial,
	LuminosityMaterial,
	ToneMappingMaterial
} from "../materials";

import { Pass } from "./pass";
import THREE from "three";

/**
 * A tone mapping pass that supports adaptive luminosity.
 *
 * If adaptivity is enabled, this pass generates a texture that represents 
 * the luminosity of the current scene and adjusts it over time to simulate 
 * the optic nerve responding to the amount of light it is receiving.
 *
 * Reference:
 *  GDC2007 - Wolfgang Engel, Post-Processing Pipeline
 *  http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 *
 * @class ToneMappingPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Boolean} [options.adaptive=true] - Whether the tone mapping should use an adaptive luminance map.
 * @param {Number} [options.resolution=256] - The render texture resolution.
 * @param {Number} [options.distinction=1.0] - A luminance distinction factor.
 */

export class ToneMappingPass extends Pass {

	constructor(options) {

		super();

		this.needsSwap = true;

		if(options === undefined) { options = {}; }

		/**
		 * Render target for the current limonosity.
		 *
		 * @property renderTargetLuminosity
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetLuminosity = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearMipMapLinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat, // Change to RED format in WebGL 2.0! Don't need colours.
			stencilBuffer: false,
			depthBuffer: false
		});

		/**
		 * Adapted luminance render target.
		 *
		 * @property renderTargetLuminosity
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetAdapted = this.renderTargetLuminosity.clone();

		this.renderTargetAdapted.texture.generateMipmaps = false;
		this.renderTargetAdapted.texture.minFilter = THREE.LinearFilter;

		/**
		 * Render target that holds a copy of the adapted limonosity.
		 *
		 * @property renderTargetX
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetPrevious = this.renderTargetAdapted.clone();

		/**
		 * Copy shader material used for saving the luminance map.
		 *
		 * @property copyMaterial
		 * @type CopyMaterial
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();

		/**
		 * Luminosity shader material.
		 *
		 * @property luminosityMaterial
		 * @type LuminosityMaterial
		 * @private
		 */

		this.luminosityMaterial = new LuminosityMaterial();

		this.luminosityMaterial.uniforms.distinction.value = (options.distinction === undefined) ? 1.0 : options.distinction;

		/**
		 * Adaptive luminance shader material.
		 *
		 * @property adaptiveLuminosityMaterial
		 * @type AdaptiveLuminosityMaterial
		 * @private
		 */

		this.adaptiveLuminosityMaterial = new AdaptiveLuminosityMaterial();

		this.resolution = (options.resolution === undefined) ? 256 : options.resolution;

		/**
		 * Tone mapping shader material.
		 *
		 * @property toneMappingMaterial
		 * @type ToneMappingMaterial
		 * @private
		 */

		this.toneMappingMaterial = new ToneMappingMaterial();

		this.adaptive = (options.adaptive === undefined) ? true : options.adaptive;

	}

	/**
	 * The resolution of the render targets. Must be a power of two for mipmapping.
	 *
	 * @property resolution
	 * @type Number
	 * @default 256
	 */

	get resolution() { return this.renderTargetLuminosity.width; }

	set resolution(x) {

		if(typeof x === "number" && x > 0) {

			this.renderTargetLuminosity.setSize(x, x);
			this.renderTargetPrevious.setSize(x, x); // Hm..
			this.renderTargetAdapted.setSize(x, x);

			this.adaptiveLuminosityMaterial.defines.MIP_LEVEL_1X1 = (Math.round(Math.log(x)) / Math.log(2)).toFixed(1);
			this.adaptiveLuminosityMaterial.needsUpdate = true;

		}

	}

	/**
	 * Whether this pass uses adaptive luminosity.
	 *
	 * @property adaptive
	 * @type Boolean
	 */

	get adaptive() { return this.toneMappingMaterial.defines.ADAPTED_LUMINANCE !== undefined; }

	set adaptive(x) {

		if(x) {

			this.toneMappingMaterial.defines.ADAPTED_LUMINANCE = "1";
			this.toneMappingMaterial.uniforms.luminanceMap.value = this.renderTargetAdapted;

		} else {

			delete this.toneMappingMaterial.defines.ADAPTED_LUMINANCE;
			this.toneMappingMaterial.uniforms.luminanceMap.value = null;

		}

		this.toneMappingMaterial.needsUpdate = true;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {Number} delta - The render delta time.
	 */

	render(renderer, readBuffer, writeBuffer, delta) {

		if(this.adaptive) {

			// Render the luminance of the current scene into a render target with mipmapping enabled.
			this.quad.material = this.luminosityMaterial;
			this.luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render(this.scene, this.camera, this.renderTargetLuminosity);

			// Use the new luminance values, the previous luminance and the frame delta to adapt the luminance over time.
			this.quad.material = this.adaptiveLuminosityMaterial;
			this.adaptiveLuminosityMaterial.uniforms.delta.value = delta;
			this.adaptiveLuminosityMaterial.uniforms.tPreviousLum.value = this.renderTargetPrevious.texture;
			this.adaptiveLuminosityMaterial.uniforms.tCurrentLum.value = this.renderTargetLuminosity.texture;
			renderer.render(this.scene, this.camera, this.renderTargetAdapted);

			// Copy the new adapted luminance value so that it can be used by the next frame.
			this.quad.material = this.copyMaterial;
			this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetAdapted.texture;
			renderer.render(this.scene, this.camera, this.renderTargetPrevious);

		}

		// Apply the tone mapping to the colours.
		this.quad.material = this.toneMappingMaterial;
		this.toneMappingMaterial.uniforms.tDiffuse.value = readBuffer.texture;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Renders something into the previous luminosity texture.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	initialise(renderer) {

		this.quad.material = new THREE.MeshBasicMaterial({color: 0x7fffff});
		renderer.render(this.scene, this.camera, this.renderTargetPrevious);
		this.quad.material.dispose();

	}

}
