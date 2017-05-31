import { DataTexture, RGBFormat, FloatType } from "three";
import { GlitchMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * Returns a random integer in the specified range.
 *
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
 */

export class GlitchPass extends Pass {

	/**
	 * Constructs a new glitch pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Texture} [options.perturbMap] - A perturbation map. If none is provided, a noise texture will be created.
	 * @param {Number} [options.dtSize=64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
	 */

	constructor(options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "GlitchPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * Glitch shader material.
		 *
		 * @type {GlitchMaterial}
		 * @private
		 */

		this.material = new GlitchMaterial();

		this.quad.material = this.material;

		/**
		 * A perturbation map.
		 *
		 * @type {Texture}
		 * @private
		 */

		this.texture = null;

		this.perturbMap = (options.perturbMap !== undefined) ? options.perturbMap : this.generatePerturbMap(options.dtSize);
		this.perturbMap.name = "Glitch.Perturbation";
		this.perturbMap.generateMipmaps = false;

		/**
		 * The effect mode.
		 *
		 * @type {GlitchMode}
		 * @default GlitchMode.SPORADIC
		 */

		this.mode = GlitchMode.SPORADIC;

		/**
		 * Counter for glitch activation and deactivation.
		 *
		 * @type {Number}
		 * @private
		 */

		this.counter = 0;

		/**
		 * A random break point for the sporadic glitch activation.
		 *
		 * @type {Number}
		 * @private
		 */

		this.breakPoint = randomInt(120, 240);

	}

	/**
	 * The current perturbation map.
	 *
	 * @type {Texture}
	 */

	get perturbMap() { return this.texture; }

	/**
	 * Assigning a new perturbation map does not destroy the current one!
	 *
	 * @type {Texture}
	 */

	set perturbMap(x) {

		this.texture = x;
		this.material.uniforms.tPerturb.value = x;

	}

	/**
	 * Destroys the current perturbation map and replaces it with a new one.
	 *
	 * @param {Number} [size=64] - The texture size.
	 * @return {DataTexture} The perturbation texture.
	 */

	generatePerturbMap(size = 64) {

		const pixels = size * size;
		const data = new Float32Array(pixels * 3);

		let dt = this.perturbMap;
		let i, x;

		for(i = 0; i < pixels; ++i) {

			x = Math.random();

			data[i * 3] = x;
			data[i * 3 + 1] = x;
			data[i * 3 + 2] = x;

		}

		if(dt !== null) {

			dt.dispose();

		}

		dt = new DataTexture(data, size, size, RGBFormat, FloatType);
		dt.needsUpdate = true;

		this.perturbMap = dt;

		return dt;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
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

		if(counter % breakPoint === 0 || mode === GlitchMode.CONSTANT_WILD) {

			uniforms.amount.value = Math.random() / 30.0;
			uniforms.angle.value = randomFloat(-Math.PI, Math.PI);
			uniforms.seedX.value = randomFloat(-1.0, 1.0);
			uniforms.seedY.value = randomFloat(-1.0, 1.0);
			uniforms.distortionX.value = randomFloat(0.0, 1.0);
			uniforms.distortionY.value = randomFloat(0.0, 1.0);

			this.breakPoint = randomInt(120, 240);
			this.counter = 0;

		} else {

			if(counter % breakPoint < breakPoint / 5 || mode === GlitchMode.CONSTANT_MILD) {

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

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

}

/**
 * A glitch mode enumeration.
 *
 * @type {Object}
 * @property {Number} SPORADIC - Sporadic glitches.
 * @property {Number} CONSTANT_MILD - Constant mild glitches.
 * @property {Number} CONSTANT_WILD - Constant wild glitches.
 */

export const GlitchMode = {

	SPORADIC: 0,
	CONSTANT_MILD: 1,
	CONSTANT_WILD: 2

};
