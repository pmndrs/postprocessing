import { LinearFilter, RGBFormat, WebGLRenderTarget } from "three";
import { CombineMaterial, KernelSize, LuminosityMaterial } from "../materials";
import { BlurPass } from "./BlurPass.js";
import { Pass } from "./Pass.js";

/**
 * A bloom pass.
 *
 * This pass renders a scene with superimposed blur by utilizing the fast Kawase
 * convolution approach.
 */

export class BloomPass extends Pass {

	/**
	 * Constructs a new bloom pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 * @param {Number} [options.intensity=1.0] - The strength of the bloom effect.
	 * @param {Number} [options.distinction=1.0] - The luminance distinction factor. Raise this value to bring out the brighter elements in the scene.
	 * @param {Number} [options.screenMode=true] - Whether the screen blend mode should be used for combining the bloom texture with the scene colors.
	 */

	constructor(options = {}) {

		super("BloomPass");

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "Bloom.Target";
		this.renderTarget.texture.generateMipmaps = false;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass(options);

		/**
		 * A combine shader material.
		 *
		 * @type {CombineMaterial}
		 * @private
		 */

		this.combineMaterial = new CombineMaterial((options.screenMode !== undefined) ? options.screenMode : true);

		this.intensity = options.intensity;

		/**
		 * A luminosity shader material.
		 *
		 * @type {LuminosityMaterial}
		 * @private
		 */

		this.luminosityMaterial = new LuminosityMaterial(true);

		this.distinction = options.distinction;

	}

	/**
	 * The resolution scale.
	 *
	 * @type {Number}
	 */

	get resolutionScale() {

		return this.blurPass.resolutionScale;

	}

	/**
	 * You need to call {@link EffectComposer#setSize} after changing this value.
	 *
	 * @type {Number}
	 */

	set resolutionScale(value = 0.5) {

		this.blurPass.resolutionScale = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * @type {KernelSize}
	 */

	set kernelSize(value = KernelSize.LARGE) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * The overall intensity of the effect.
	 *
	 * @type {Number}
	 */

	get intensity() {

		return this.combineMaterial.uniforms.opacity2.value;

	}

	/**
	 * @type {Number}
	 */

	set intensity(value = 1.0) {

		this.combineMaterial.uniforms.opacity2.value = value;

	}

	/**
	 * The luminance distinction factor.
	 *
	 * @type {Number}
	 */

	get distinction() {

		return this.luminosityMaterial.uniforms.distinction.value;

	}

	/**
	 * @type {Number}
	 */

	set distinction(value = 1.0) {

		this.luminosityMaterial.uniforms.distinction.value = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * If enabled, the result will be dithered to remove banding artifacts.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * Renders the effect.
	 *
	 * Extracts a luminance map from the read buffer, blurs it and combines it
	 * with the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const quad = this.quad;
		const scene = this.scene;
		const camera = this.camera;
		const blurPass = this.blurPass;

		const luminosityMaterial = this.luminosityMaterial;
		const combineMaterial = this.combineMaterial;
		const renderTarget = this.renderTarget;

		// Luminance filter.
		quad.material = luminosityMaterial;
		luminosityMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(scene, camera, renderTarget);

		// Convolution phase.
		blurPass.render(renderer, renderTarget, renderTarget);

		// Render the original scene with superimposed blur.
		quad.material = combineMaterial;
		combineMaterial.uniforms.texture1.value = readBuffer.texture;
		combineMaterial.uniforms.texture2.value = renderTarget.texture;

		renderer.render(scene, camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Adjusts the format of the render targets.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.blurPass.initialize(renderer, alpha);

		if(!alpha) {

			this.renderTarget.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.blurPass.setSize(width, height);

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTarget.setSize(width, height);

	}

}
