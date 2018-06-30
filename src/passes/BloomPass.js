import { LinearFilter, RGBFormat, Vector2, WebGLRenderTarget } from "three";
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
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

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
	 * Indicates whether the effect should be applied to the input buffer.
	 *
	 * @type {Boolean}
	 */

	get blend() {

		return this.needsSwap;

	}

	/**
	 * If disabled, the input buffer will remain unaffected.
	 *
	 * You may use the {@link BloomPass#overlay} texture to apply the effect to
	 * your scene.
	 *
	 * @type {Boolean}
	 */

	set blend(value) {

		this.needsSwap = value;

	}

	/**
	 * The effect overlay texture.
	 *
	 * @type {Texture}
	 */

	get overlay() {

		return this.renderTarget.texture;

	}

	/**
	 * The resolution scale.
	 *
	 * @type {Number}
	 * @deprecated Use getResolutionScale() instead.
	 */

	get resolutionScale() {

		console.warn("BloomPass.resolutionScale has been deprecated, please use BloomPass.getResolutionScale()");

		return this.getResolutionScale();

	}

	/**
	 * @type {Number}
	 * @deprecated Use setResolutionScale(Number) instead.
	 */

	set resolutionScale(value) {

		console.warn("BloomPass.resolutionScale has been deprecated, please use BloomPass.setResolutionScale(Number)");

		this.setResolutionScale(value);

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 */

	setResolutionScale(scale) {

		this.blurPass.setResolutionScale(scale);
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		const scene = this.scene;
		const camera = this.camera;
		const blurPass = this.blurPass;

		const luminosityMaterial = this.luminosityMaterial;
		const combineMaterial = this.combineMaterial;
		const renderTarget = this.renderTarget;

		// Luminance filter.
		this.setFullscreenMaterial(luminosityMaterial);
		luminosityMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
		renderer.render(scene, camera, renderTarget);

		// Convolution phase.
		blurPass.render(renderer, renderTarget, renderTarget);

		if(this.blend) {

			// Render the original scene with superimposed blur.
			this.setFullscreenMaterial(combineMaterial);
			combineMaterial.uniforms.texture1.value = inputBuffer.texture;
			combineMaterial.uniforms.texture2.value = renderTarget.texture;

			renderer.render(scene, camera, this.renderToScreen ? null : outputBuffer);

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		// Remember the original resolution.
		this.resolution.set(width, height);

		this.blurPass.setSize(width, height);

		// The blur pass applies the resolution scale.
		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTarget.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
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

}
