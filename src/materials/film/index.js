import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

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
 * Optimized scanlines and noise with intensity scaling by Georg "Leviathan"
 * Steinrohder. (This version is provided under a Creative Commons Attribution
 * 3.0 License: http://creativecommons.org/licenses/by/3.0)
 *
 * The sepia effect is based on:
 *  https://github.com/evanw/glfx.js
 *
 * The vignette code is based on PaintEffect postprocess from ro.me:
 *  http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 *
 * @class FilmMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Boolean} [options.greyscale=false] - Enable greyscale effect. Greyscale and sepia are mutually exclusive.
 * @param {Boolean} [options.sepia=false] - Enable sepia effect. Greyscale and sepia are mutually exclusive.
 * @param {Boolean} [options.vignette=false] - Apply vignette effect.
 * @param {Boolean} [options.eskil=false] - Use Eskil's vignette approach. The default looks dusty while Eskil looks burned out.
 * @param {Boolean} [options.screenMode=true] - Whether the screen blend mode should be used for noise and scanlines. Both of these effects are computed independently.
 * @param {Boolean} [options.noise=true] - Show noise-based film grain.
 * @param {Boolean} [options.scanlines=true] - Show scanlines.
 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
 * @param {Number} [options.scanlineIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
 * @param {Number} [options.greyscaleIntensity=1.0] - The intensity of the greyscale effect.
 * @param {Number} [options.sepiaIntensity=1.0] - The intensity of the sepia effect.
 * @param {Number} [options.vignetteOffset=1.0] - The offset of the vignette effect.
 * @param {Number} [options.vignetteDarkness=1.0] - The darkness of the vignette effect.
 */

export class FilmMaterial extends ShaderMaterial {

	constructor(options = {}) {

		if(options.screenMode === undefined) { options.screenMode = true; }
		if(options.noise === undefined) { options.noise = true; }
		if(options.scanlines === undefined) { options.scanlines = true; }

		if(options.greyscale === undefined) { options.greyscale = false; }
		if(options.sepia === undefined) { options.sepia = false; }
		if(options.vignette === undefined) { options.vignette = false; }
		if(options.eskil === undefined) { options.eskil = false; }

		if(options.noiseIntensity === undefined) { options.noiseIntensity = 0.5; }
		if(options.scanlineIntensity === undefined) { options.scanlineIntensity = 0.05; }
		if(options.greyscaleIntensity === undefined) { options.greyscaleIntensity = 1.0; }
		if(options.sepiaIntensity === undefined) { options.sepiaIntensity = 1.0; }

		if(options.vignetteOffset === undefined) { options.vignetteOffset = 1.0; }
		if(options.vignetteDarkness === undefined) { options.vignetteDarkness = 1.0; }

		super({

			type: "FilmMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				time: new Uniform(0.0),

				noiseIntensity: new Uniform(options.noiseIntensity),
				scanlineIntensity: new Uniform(options.scanlineIntensity),
				scanlineCount: new Uniform(0.0),

				greyscaleIntensity: new Uniform(options.greyscaleIntensity),
				sepiaIntensity: new Uniform(options.sepiaIntensity),

				vignetteOffset: new Uniform(options.vignetteOffset),
				vignetteDarkness: new Uniform(options.vignetteDarkness)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(options.greyscale) { this.defines.GREYSCALE = "1"; }
		if(options.sepia) { this.defines.SEPIA = "1"; }
		if(options.vignette) { this.defines.VIGNETTE = "1"; }
		if(options.eskil) { this.defines.ESKIL = "1"; }

		if(options.screenMode) { this.defines.SCREEN_MODE = "1"; }
		if(options.noise) { this.defines.NOISE = "1"; }
		if(options.scanlines) { this.defines.SCANLINES = "1"; }

	}

}
