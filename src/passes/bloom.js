import THREE from "three";
import { CopyMaterial, CombineMaterial, LuminosityMaterial, ConvolutionMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A bloom pass.
 *
 * This pass renders a scene with superimposed blur by utilising the fast Kawase
 * convolution approach.
 *
 * @class BloomPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
 * @param {Number} [options.blurriness=1.0] - The scale of the blur.
 * @param {Number} [options.strength=1.0] - The bloom strength.
 * @param {Number} [options.distinction=1.0] - The luminance distinction factor. Raise this value to bring out the brighter elements in the scene.
 */

export class BloomPass extends Pass {

	constructor(options = {}) {

		super();

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
			generateMipmaps: false,
			stencilBuffer: false,
			depthBuffer: false
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
		 * The resolution scale.
		 *
		 * You need to call the setSize method of the EffectComposer after changing
		 * this value.
		 *
		 * @property resolutionScale
		 * @type Number
		 * @default 0.5
		 */

		this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

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

		if(options.distinction !== undefined) { this.luminosityMaterial.uniforms.distinction.value = options.distinction; }

		/**
		 * Convolution shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		this.blurriness = options.blurriness;

	}

	/**
	 * The strength of the preliminary blur phase.
	 *
	 * @property blurriness
	 * @type Number
	 * @default 1.0
	 */

	get blurriness() { return this.convolutionMaterial.scale; }

	set blurriness(x) {

		if(typeof x === "number") {

			this.convolutionMaterial.scale = x;

		}

	}

	/**
	 * Renders the effect.
	 *
	 * Applies a luminance filter and convolution blur to the read buffer and
	 * renders the result into a seperate render target. The result is additively
	 * blended with the read buffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		let state = renderer.state;

		// Luminance filter.
		this.quad.material = this.luminosityMaterial;
		this.luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		state.setDepthWrite(true);
		renderer.render(this.scene, this.camera, this.renderTargetX);
		state.setDepthWrite(false);

		// Convolution phase.
		this.quad.material = this.convolutionMaterial;

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;
		renderer.render(this.scene, this.camera, this.renderTargetX);

		this.convolutionMaterial.adjustKernel();
		this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX.texture;
		renderer.render(this.scene, this.camera, this.renderTargetY);

		// Render the original scene with superimposed blur.
		if(this.renderToScreen) {

			this.quad.material = this.combineMaterial;
			this.combineMaterial.uniforms.texture1.value = readBuffer.texture;
			this.combineMaterial.uniforms.texture2.value = this.renderTargetY.texture;

			renderer.render(this.scene, this.camera);

		} else {

			this.quad.material = this.copyMaterial;
			this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetY.texture;

			renderer.render(this.scene, this.camera, readBuffer, false);

		}

	}

	/**
	 * Adjusts the format and size of the render targets.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		let size = renderer.getSize();
		this.setSize(size.width, size.height);

		if(!alpha) {

			this.renderTargetX.texture.format = THREE.RGBFormat;
			this.renderTargetY.texture.format = THREE.RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		width = Math.floor(width * this.resolutionScale);
		height = Math.floor(height * this.resolutionScale);

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
