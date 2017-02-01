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
 * @param {Texture} [options.perturbMap] - A perturbation map.
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

		/**
		 * A perturbation map.
		 *
		 * If none is provided, a noise texture will be created.
		 * This texture will automatically be destroyed when the EffectComposer is
		 * deleted.
		 *
		 * @property perturbMap
		 * @type Texture
		 */

		if(options.perturbMap !== undefined) {

			this.perturbMap = options.perturbMap;
			this.perturbMap.generateMipmaps = false;
			this.material.uniforms.tPerturb.value = this.perturbMap;

		} else {

			this.perturbMap = null;
			this.generatePerturbMap((options.dtSize !== undefined) ? options.dtSize : 64);

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

			} else if(mode === GlitchPass.Mode.SPORADIC) {

				uniforms.active.value = false;

			}

			++this.counter;

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Destroys the currently set texture and generates a simple noise map.
	 *
	 * @method generatePerturbMap
	 * @private
	 * @param {Number} size - The texture size.
	 */

	generatePerturbMap(size) {

		const pixels = size * size;
		const data = new Float32Array(pixels * 3);

		let i, x;

		for(i = 0; i < pixels; ++i) {

			x = Math.random();

			data[i * 3] = x;
			data[i * 3 + 1] = x;
			data[i * 3 + 2] = x;

		}

		if(this.perturbMap !== null) {

			this.perturbMap.dispose();

		}

		this.perturbMap = new DataTexture(data, size, size, RGBFormat, FloatType);
		this.perturbMap.needsUpdate = true;

		this.material.uniforms.tPerturb.value = this.perturbMap;

	}

}

/**
 * A glitch mode enumeration.
 *
 * SPORADIC is the default mode (randomly timed glitches).
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
