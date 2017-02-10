import { DataTexture, RGBFormat, FloatType } from "three";
import { GlitchMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * Returns a random integer in the specified range.
 *
 * @method randomInt
 * @private
 * @static
 * @param {Number} low - The lowest possible value.
 * @param {Number} high - The highest possible value.
 * @return {Number} The random value.
 */

function randomInt(low, high) {

	return low + Math.floor(Math.random() * (high - low + 1));

}

/**
 * Returns a random float in the specified range.
 *
 * @method randomFloat
 * @private
 * @static
 * @param {Number} low - The lowest possible value.
 * @param {Number} high - The highest possible value.
 * @return {Number} The random value.
 */

function randomFloat(low, high) {

	return low + Math.random() * (high - low);

}

/**
 * A glitch pass.
 *
 * @class GlitchPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Object} [options] - The options.
 * @param {Texture} [options.perturbMap] - A perturbation map. If none is provided, a noise texture will be created.
 * @param {Number} [options.dtSize=64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
 */

export class GlitchPass extends Pass {

	constructor(options = {}) {

		super();

		this.needsSwap = true;

		/**
		 * Glitch shader material.
		 *
		 * @property material
		 * @type GlitchMaterial
		 * @private
		 */

		this.material = new GlitchMaterial();

		this.quad.material = this.material;

		if(options.perturbMap !== undefined) {

			this.perturbMap = options.perturbMap;
			this.perturbMap.generateMipmaps = false;

		} else {

			this.perturbMap = this.generatePerturbMap(options.dtSize);

		}

		/**
		 * The effect mode.
		 *
		 * Check the Mode enumeration for available modes.
		 *
		 * @property mode
		 * @type GlitchPass.Mode
		 * @default GlitchPass.Mode.SPORADIC
		 */

		this.mode = GlitchPass.Mode.SPORADIC;

		/**
		 * Counter for glitch activation/deactivation.
		 *
		 * @property counter
		 * @type Number
		 * @private
		 */

		this.counter = 0;

		/**
		 * A random break point for the sporadic glitch activation.
		 *
		 * @property breakPoint
		 * @type Number
		 * @private
		 */

		this.breakPoint = randomInt(120, 240);

	}

	/**
	 * A perturbation map.
	 *
	 * @property perturbMap
	 * @type Texture
	 */

	get perturbMap() { return this.material.uniforms.tPerturb.value; }

	set perturbMap(x) {

		this.material.uniforms.tPerturb.value = x;

	}

	/**
	 * Generates a new perturbation map.
	 *
	 * @method generatePerturbMap
	 * @param {Number} [size=64] - The texture size.
	 * @return {DataTexture} The perturbation texture.
	 */

	generatePerturbMap(size = 64) {

		const pixels = size * size;
		const data = new Float32Array(pixels * 3);

		let i, x, dt;

		for(i = 0; i < pixels; ++i) {

			x = Math.random();

			data[i * 3] = x;
			data[i * 3 + 1] = x;
			data[i * 3 + 2] = x;

		}

		dt = new DataTexture(data, size, size, RGBFormat, FloatType);
		dt.needsUpdate = true;

		return dt;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const mode = this.mode;
		const counter = this.counter;
		const breakPoint = this.breakPoint;
		const uniforms = this.material.uniforms;

		uniforms.tDiffuse.value = readBuffer.texture;
		uniforms.seed.value = Math.random();
		uniforms.active.value = true;

		if(counter % breakPoint === 0 || mode === GlitchPass.Mode.CONSTANT_WILD) {

			uniforms.amount.value = Math.random() / 30.0;
			uniforms.angle.value = randomFloat(-Math.PI, Math.PI);
			uniforms.seedX.value = randomFloat(-1.0, 1.0);
			uniforms.seedY.value = randomFloat(-1.0, 1.0);
			uniforms.distortionX.value = randomFloat(0.0, 1.0);
			uniforms.distortionY.value = randomFloat(0.0, 1.0);

			this.breakPoint = randomInt(120, 240);
			this.counter = 0;

		} else {

			if(counter % breakPoint < breakPoint / 5 || mode === GlitchPass.Mode.CONSTANT_MILD) {

				uniforms.amount.value = Math.random() / 90.0;
				uniforms.angle.value = randomFloat(-Math.PI, Math.PI);
				uniforms.distortionX.value = randomFloat(0.0, 1.0);
				uniforms.distortionY.value = randomFloat(0.0, 1.0);
				uniforms.seedX.value = randomFloat(-0.3, 0.3);
				uniforms.seedY.value = randomFloat(-0.3, 0.3);

			} else {

				// Sporadic.
				uniforms.active.value = false;

			}

		}

		++this.counter;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer, this.clear);

	}

}

/**
 * A glitch mode enumeration.
 *
 * SPORADIC is the default mode which results in randomly timed glitches.
 *
 * @property GlitchPass.Mode
 * @type Object
 * @static
 * @final
 */

GlitchPass.Mode = {
	SPORADIC: 0,
	CONSTANT_MILD: 1,
	CONSTANT_WILD: 2
};
