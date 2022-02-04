import { NearestFilter, RepeatWrapping, RGBAFormat, Uniform, Vector2 } from "three";
import { NoiseTexture } from "../images/textures/NoiseTexture";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/glitch/shader.frag";

const textureTag = "Glitch.Generated";

/**
 * Returns a random float in the specified range.
 *
 * @private
 * @param {Number} low - The lowest possible value.
 * @param {Number} high - The highest possible value.
 * @return {Number} The random value.
 */

function randomFloat(low, high) {

	return low + Math.random() * (high - low);

}

/**
 * A glitch mode enumeration.
 *
 * @type {Object}
 * @property {Number} DISABLED - No glitches.
 * @property {Number} SPORADIC - Sporadic glitches.
 * @property {Number} CONSTANT_MILD - Constant mild glitches.
 * @property {Number} CONSTANT_WILD - Constant wild glitches.
 */

export const GlitchMode = {
	DISABLED: 0,
	SPORADIC: 1,
	CONSTANT_MILD: 2,
	CONSTANT_WILD: 3
};

/**
 * A glitch effect.
 *
 * This effect can be used in conjunction with the {@link ChromaticAberrationEffect}.
 *
 * Reference: https://github.com/staffantan/unityglitch
 */

export class GlitchEffect extends Effect {

	/**
	 * Constructs a new glitch effect.
	 *
	 * TODO Change ratio to 0.15.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Vector2} [options.chromaticAberrationOffset] - A chromatic aberration offset. If provided, the glitch effect will influence this offset.
	 * @param {Vector2} [options.delay] - The minimum and maximum delay between glitch activations in seconds.
	 * @param {Vector2} [options.duration] - The minimum and maximum duration of a glitch in seconds.
	 * @param {Vector2} [options.strength] - The strength of weak and strong glitches.
	 * @param {Texture} [options.perturbationMap] - A perturbation map. If none is provided, a noise texture will be created.
	 * @param {Number} [options.dtSize=64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
	 * @param {Number} [options.columns=0.05] - The scale of the blocky glitch columns.
	 * @param {Number} [options.ratio=0.85] - The threshold for strong glitches.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		chromaticAberrationOffset = null,
		delay = new Vector2(1.5, 3.5),
		duration = new Vector2(0.6, 1.0),
		strength = new Vector2(0.3, 1.0),
		columns = 0.05,
		ratio = 0.85,
		perturbationMap = null,
		dtSize = 64
	} = {}) {

		super("GlitchEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["perturbationMap", new Uniform(null)],
				["columns", new Uniform(columns)],
				["active", new Uniform(false)],
				["random", new Uniform(1.0)],
				["seed", new Uniform(new Vector2())],
				["distortion", new Uniform(new Vector2())]
			])
		});

		this.setPerturbationMap((perturbationMap === null) ? this.generatePerturbationMap(dtSize) : perturbationMap);

		/**
		 * A random glitch break point.
		 *
		 * @type {Number}
		 * @private
		 */

		this.breakPoint = new Vector2(
			randomFloat(this.delay.x, this.delay.y),
			randomFloat(this.duration.x, this.duration.y)
		);

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.time = 0;

		/**
		 * A distortion vector.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.distortion = this.uniforms.get("distortion").value;

		/**
		 * The minimum and maximum delay between glitch activations in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use getMinDelay(), setMinDelay(), getMaxDelay() and setMaxDelay() instead.
		 */

		this.delay = delay;

		/**
		 * The minimum and maximum duration of a glitch in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use getMinDuration(), setMinDuration(), getMaxDuration() and setMaxDuration() instead.
		 */

		this.duration = duration;

		/**
		 * The strength of weak and strong glitches.
		 *
		 * @type {Vector2}
		 * @deprecated Use getMinStrength(), setMinStrength(), getMaxStrength() and setMaxStrength() instead.
		 */

		this.strength = strength;

		/**
		 * The effect mode.
		 *
		 * @type {GlitchMode}
		 * @deprecated Use getMode() and setMode() instead.
		 */

		this.mode = GlitchMode.SPORADIC;

		/**
		 * The glitch ratio (currently inverted / treated as a threshold for strong glitches).
		 *
		 * @type {Number}
		 * @deprecated Use getGlitchRatio() and setGlitchRatio() instead.
		 */

		this.ratio = ratio;

		/**
		 * The chromatic aberration offset.
		 *
		 * @type {Vector2}
		 * @deprecated Use getChromaticAberrationOffset() and setChromaticAberrationOffset() instead.
		 */

		this.chromaticAberrationOffset = chromaticAberrationOffset;

	}

	/**
	 * Random number seeds.
	 *
	 * @type {Vector2}
	 * @private
	 */

	get seeds() {

		return this.uniforms.get("seeds").value;

	}

	/**
	 * Indicates whether the glitch effect is currently active.
	 *
	 * @type {Boolean}
	 * @deprecated Use isActive() instead.
	 */

	get active() {

		return this.isActive();

	}

	/**
	 * Indicates whether the glitch effect is currently active.
	 *
	 * @return {Boolean} Whether the glitch effect is active.
	 */

	isActive() {

		return this.uniforms.get("active").value;

	}

	/**
	 * Returns the minimum delay between glitch activations.
	 *
	 * @return {Number} The minimum delay in seconds.
	 */

	getMinDelay() {

		return this.delay.x;

	}

	/**
	 * Sets the minimum delay between glitch activations.
	 *
	 * @param {Number} value - The minimum delay in seconds.
	 */

	setMinDelay(value) {

		this.delay.x = value;

	}

	/**
	 * Returns the maximum delay between glitch activations.
	 *
	 * @return {Number} The maximum delay in seconds.
	 */

	getMaxDelay() {

		return this.delay.y;

	}

	/**
	 * Sets the maximum delay between glitch activations.
	 *
	 * @param {Number} value - The maximum delay in seconds.
	 */

	setMaxDelay(value) {

		this.delay.y = value;

	}

	/**
	 * Returns the minimum duration of sporadic glitches.
	 *
	 * @return {Number} The minimum duration in seconds.
	 */

	getMinDuration() {

		return this.duration.x;

	}

	/**
	 * Sets the minimum duration of sporadic glitches.
	 *
	 * @param {Number} value - The minimum duration in seconds.
	 */

	setMinDuration(value) {

		this.duration.x = value;

	}

	/**
	 * Returns the maximum duration of sporadic glitches.
	 *
	 * @return {Number} The maximum duration in seconds.
	 */

	getMaxDuration() {

		return this.duration.y;

	}

	/**
	 * Sets the maximum duration of sporadic glitches.
	 *
	 * @param {Number} value - The maximum duration in seconds.
	 */

	setMaxDuration(value) {

		this.duration.y = value;

	}

	/**
	 * Returns the strength of weak glitches.
	 *
	 * @return {Number} The strength.
	 */

	getMinStrength() {

		return this.strength.x;

	}

	/**
	 * Sets the strength of weak glitches.
	 *
	 * @param {Number} value - The strength.
	 */

	setMinStrength(value) {

		this.strength.x = value;

	}

	/**
	 * Returns the strength of strrong glitches.
	 *
	 * @return {Number} The strength.
	 */

	getMaxStrength() {

		return this.strength.y;

	}

	/**
	 * Sets the strength of strong glitches.
	 *
	 * @param {Number} value - The strength.
	 */

	setMaxStrength(value) {

		this.strength.y = value;

	}

	/**
	 * Returns the current glitch mode.
	 *
	 * @return {GlitchMode} The mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the current glitch mode.
	 *
	 * @param {GlitchMode} value - The mode.
	 */

	setMode(value) {

		this.mode = value;

	}

	/**
	 * Returns the glitch ratio.
	 *
	 * TODO Remove inversion.
	 * @return {Number} The ratio.
	 */

	getGlitchRatio() {

		return (1.0 - this.ratio);

	}

	/**
	 * Sets the ratio of weak (0.0) and strong (1.0) glitches.
	 *
	 * TODO Remove inversion.
	 * @param {Number} value - The ratio. Range is [0.0, 1.0].
	 */

	setGlitchRatio(value) {

		this.ratio = Math.min(Math.max(1.0 - value, 0.0), 1.0);

	}

	/**
	 * Returns the chromatic aberration offset.
	 *
	 * @return {Vector2} The offset.
	 */

	getChromaticAberrationOffset() {

		return this.chromaticAberrationOffset;

	}

	/**
	 * Sets the chromatic aberration offset.
	 *
	 * @param {Vector2} value - The offset.
	 */

	setChromaticAberrationOffset(value) {

		this.chromaticAberrationOffset = value;

	}

	/**
	 * Returns the current perturbation map.
	 *
	 * @return {Texture} The current perturbation map.
	 */

	getPerturbationMap() {

		return this.uniforms.get("perturbationMap").value;

	}

	/**
	 * Replaces the current perturbation map with the given one.
	 *
	 * The current map will be disposed if it was generated by this effect.
	 *
	 * @param {Texture} value - The new perturbation map.
	 */

	setPerturbationMap(value) {

		const currentMap = this.getPerturbationMap();

		if(currentMap !== null && currentMap.name === textureTag) {

			currentMap.dispose();

		}

		value.minFilter = value.magFilter = NearestFilter;
		value.wrapS = value.wrapT = RepeatWrapping;
		value.generateMipmaps = false;

		this.uniforms.get("perturbationMap").value = value;

	}

	/**
	 * Generates a perturbation map.
	 *
	 * @param {Number} [value=64] - The texture size.
	 * @return {DataTexture} The perturbation map.
	 */

	generatePerturbationMap(value = 64) {

		const map = new NoiseTexture(value, value, RGBAFormat);
		map.name = textureTag;
		return map;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const mode = this.mode;
		const breakPoint = this.breakPoint;
		const offset = this.chromaticAberrationOffset;
		const s = this.strength;

		let time = this.time;
		let active = false;
		let r = 0.0, a = 0.0;
		let trigger;

		if(mode !== GlitchMode.DISABLED) {

			if(mode === GlitchMode.SPORADIC) {

				time += deltaTime;
				trigger = (time > breakPoint.x);

				if(time >= (breakPoint.x + breakPoint.y)) {

					breakPoint.set(
						randomFloat(this.delay.x, this.delay.y),
						randomFloat(this.duration.x, this.duration.y)
					);

					time = 0;

				}

			}

			r = Math.random();
			this.uniforms.get("random").value = r;

			// TODO change > to <.
			if((trigger && r > this.ratio) || mode === GlitchMode.CONSTANT_WILD) {

				active = true;

				r *= s.y * 0.03;
				a = randomFloat(-Math.PI, Math.PI);

				this.seeds.set(randomFloat(-s.y, s.y), randomFloat(-s.y, s.y));
				this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));

			} else if(trigger || mode === GlitchMode.CONSTANT_MILD) {

				active = true;

				r *= s.x * 0.03;
				a = randomFloat(-Math.PI, Math.PI);

				this.seeds.set(randomFloat(-s.x, s.x), randomFloat(-s.x, s.x));
				this.distortion.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));

			}

			this.time = time;

		}

		if(offset !== null) {

			if(active) {

				offset.set(Math.cos(a), Math.sin(a)).multiplyScalar(r);

			} else {

				offset.set(0.0, 0.0);

			}

		}

		this.uniforms.get("active").value = active;

	}

}


