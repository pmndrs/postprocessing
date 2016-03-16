import { FilmMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A film pass providing scan lines, greyscale and noise effects.
 *
 * @class FilmPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks more burned out.
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

export class FilmPass extends Pass {

	constructor(options) {

		super();

		this.needsSwap = true;

		if(options === undefined) { options = {}; }

		/**
		 * Film shader material.
		 *
		 * @property material
		 * @type FilmMaterial
		 * @private
		 */

		this.material = new FilmMaterial(options);

		this.quad.material = this.material;

		/**
		 * The amount of scanlines in percent, relative to the screen height.
		 *
		 * You need to call the setSize method of the EffectComposer after 
		 * changing this value.
		 *
		 * @property scanlineDensity
		 * @type Number
		 * @default 1.25
		 */

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

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

		this.material.uniforms.tDiffuse.value = readBuffer;
		this.material.uniforms.time.value += delta;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Adjusts the scanline count using the renderer's height.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	initialise(renderer) {

		let size = renderer.getSize();
		this.setSize(size.width, size.height);

	}

	/**
	 * Adjusts the scanline count using the renderer's height.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);

	}

}
