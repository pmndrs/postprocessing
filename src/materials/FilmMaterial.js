import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/film/shader.frag";
import vertex from "./glsl/film/shader.vert";

/**
 * A cinematic shader that provides the following effects:
 *  - Film Grain
 *  - Scanlines
 *  - Vignette
 *  - Greyscale
 *  - Sepia
 *
 * Original scanlines algorithm by Pat "Hawthorne" Shearon.
 *  http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Optimised scanlines and noise with intensity scaling by Georg "Leviathan"
 * Steinrohder. This version was provided under a Creative Commons Attribution
 * 3.0 License: http://creativecommons.org/licenses/by/3.0.
 *
 * The sepia effect is based on:
 *  https://github.com/evanw/glfx.js
 *
 * The vignette code is based on PaintEffect postprocess from ro.me:
 *  http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

export class FilmMaterial extends ShaderMaterial {

	/**
	 * Constructs a new film material.
	 *
	 * @param {Object} [options] - The options. Disabled effects will not be included in the final shader and have no negative impact on performance.
	 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
	 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
	 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks burned out.
	 * @param {Boolean} [options.screenMode=true] - Whether the screen blend mode should be used for noise and scanlines. Both of these effects are computed independently.
	 * @param {Boolean} [options.noise=true] - Show noise-based film grain.
	 * @param {Boolean} [options.scanlines=true] - Show scanlines.
	 * @param {Boolean} [options.grid=true] - Show a grid.
	 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity.
	 * @param {Number} [options.scanlineIntensity=0.05] - The scanline intensity.
	 * @param {Number} [options.gridIntensity=1.0] - The grid strength. 0.0 to 1.0.
	 * @param {Number} [options.greyscaleIntensity=1.0] - The intensity of the greyscale effect. 0.0 to 1.0.
	 * @param {Number} [options.sepiaIntensity=1.0] - The intensity of the sepia effect. 0.0 to 1.0.
	 * @param {Number} [options.vignetteOffset=1.0] - The offset of the vignette effect. 0.0 to 1.0.
	 * @param {Number} [options.vignetteDarkness=1.0] - The darkness of the vignette effect. 0.0 to 1.0.
	 */

	constructor(options = {}) {

		const settings = Object.assign({

			screenMode: true,
			noise: true,
			scanlines: true,
			grid: false,

			greyscale: false,
			sepia: false,
			vignette: false,
			eskil: false,

			noiseIntensity: 0.5,
			scanlineIntensity: 0.05,
			gridIntensity: 1.0,
			greyscaleIntensity: 1.0,
			sepiaIntensity: 1.0,

			vignetteOffset: 1.0,
			vignetteDarkness: 1.0

		}, options);

		super({

			type: "FilmMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				time: new Uniform(0.0),

				noiseIntensity: new Uniform(settings.noiseIntensity),
				scanlineIntensity: new Uniform(settings.scanlineIntensity),
				gridIntensity: new Uniform(settings.gridIntensity),

				scanlineCount: new Uniform(0.0),
				gridScale: new Uniform(new Vector2()),
				gridLineWidth: new Uniform(0.0),

				greyscaleIntensity: new Uniform(settings.greyscaleIntensity),
				sepiaIntensity: new Uniform(settings.sepiaIntensity),

				vignetteOffset: new Uniform(settings.vignetteOffset),
				vignetteDarkness: new Uniform(settings.vignetteDarkness)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setScreenModeEnabled(settings.screenMode);
		this.setNoiseEnabled(settings.noise);
		this.setScanlinesEnabled(settings.scanlines);
		this.setGridEnabled(settings.grid);
		this.setGreyscaleEnabled(settings.greyscale);
		this.setSepiaEnabled(settings.sepia);
		this.setVignetteEnabled(settings.vignette);
		this.setEskilEnabled(settings.eskil);

	}

	/**
	 * Enables or disables the Screen blend mode.
	 *
	 * @param {Boolean} enabled - Whether the Screen blend mode should be enabled.
	 */

	setScreenModeEnabled(enabled) {

		if(enabled) {

			this.defines.SCREEN_MODE = "1";

		} else {

			delete this.defines.SCREEN_MODE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the noise effect.
	 *
	 * @param {Boolean} enabled - Whether the noise effect should be enabled.
	 */

	setNoiseEnabled(enabled) {

		if(enabled) {

			this.defines.NOISE = "1";

		} else {

			delete this.defines.NOISE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the scanlines effect.
	 *
	 * @param {Boolean} enabled - Whether the scanlines effect should be enabled.
	 */

	setScanlinesEnabled(enabled) {

		if(enabled) {

			this.defines.SCANLINES = "1";

		} else {

			delete this.defines.SCANLINES;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the grid effect.
	 *
	 * @param {Boolean} enabled - Whether the grid effect should be enabled.
	 */

	setGridEnabled(enabled) {

		if(enabled) {

			this.defines.GRID = "1";

		} else {

			delete this.defines.GRID;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the greyscale effect.
	 *
	 * @param {Boolean} enabled - Whether the greyscale effect should be enabled.
	 */

	setGreyscaleEnabled(enabled) {

		if(enabled) {

			this.defines.GREYSCALE = "1";

		} else {

			delete this.defines.GREYSCALE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the sepia effect.
	 *
	 * @param {Boolean} enabled - Whether the sepia effect should be enabled.
	 */

	setSepiaEnabled(enabled) {

		if(enabled) {

			this.defines.SEPIA = "1";

		} else {

			delete this.defines.SEPIA;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the Vignette effect.
	 *
	 * @param {Boolean} enabled - Whether the Vignette effect should be enabled.
	 */

	setVignetteEnabled(enabled) {

		if(enabled) {

			this.defines.VIGNETTE = "1";

		} else {

			delete this.defines.VIGNETTE;

		}

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the Eskil Vignette effect.
	 *
	 * Has no effect if Vignette is disabled.
	 *
	 * @param {Boolean} enabled - Whether the Eskil Vignette effect should be enabled.
	 */

	setEskilEnabled(enabled) {

		if(enabled) {

			this.defines.ESKIL = "1";

		} else {

			delete this.defines.ESKIL;

		}

		this.needsUpdate = true;

	}

}
