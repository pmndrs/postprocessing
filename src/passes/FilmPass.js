import { FilmMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A film pass.
 *
 * Provides various cinematic effects.
 */

export class FilmPass extends Pass {

	/**
	 * Constructs a new film pass.
	 *
	 * @param {Object} [options] - The options. Disabled effects have no negative impact on performance.
	 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
	 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks more burned out.
	 * @param {Boolean} [options.screenMode=true] - Whether the screen blend mode should be used for noise and scanlines.
	 * @param {Boolean} [options.scanlines=true] - Show scanlines.
	 * @param {Boolean} [options.noise=true] - Show noise-based film grain.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlineIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
	 * @param {Number} [options.scanlineDensity=1.0] - The number of scanlines in percent, relative to the screen height.
	 * @param {Number} [options.greyscaleIntensity=1.0] - The intensity of the greyscale effect.
	 * @param {Number} [options.sepiaIntensity=1.0] - The intensity of the sepia effect.
	 * @param {Number} [options.vignetteOffset=1.0] - The offset of the vignette effect.
	 * @param {Number} [options.vignetteDarkness=1.0] - The darkness of the vignette effect.
	 */

	constructor(options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "FilmPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * Film shader material.
		 *
		 * @type {FilmMaterial}
		 * @private
		 */

		this.material = new FilmMaterial(options);

		this.quad.material = this.material;

		/**
		 * The amount of scanlines in percent, relative to the screen height.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 * @default 1.25
		 */

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {Number} delta - The render delta time.
	 */

	render(renderer, readBuffer, writeBuffer, delta) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Adjusts the scanline count using the renderer's height.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);

	}

}
