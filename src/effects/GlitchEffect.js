import { NearestFilter, RepeatWrapping, RGBAFormat, Uniform, Vector2 } from "three";
import { GlitchMode } from "../enums/GlitchMode.js";
import { NoiseTexture } from "../textures/NoiseTexture.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/glitch.frag";

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
			uniforms: new Map([
				["perturbationMap", new Uniform(null)],
				["columns", new Uniform(columns)],
				["active", new Uniform(false)],
				["random", new Uniform(1.0)],
				["seeds", new Uniform(new Vector2())],
				["distortion", new Uniform(new Vector2())]
			])
		});

		if(perturbationMap === null) {

			const map = new NoiseTexture(dtSize, dtSize, RGBAFormat);
			map.name = textureTag;
			this.perturbationMap = map;

		} else {

			this.perturbationMap = perturbationMap;

		}

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.time = 0;

		/**
		 * A shortcut to the distortion vector.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.distortion = this.uniforms.get("distortion").value;

		/**
		 * The minimum and maximum delay between glitch activations in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use minDelay and maxDelay instead.
		 */

		this.delay = delay;

		/**
		 * The minimum and maximum duration of a glitch in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use minDuration and maxDuration instead.
		 */

		this.duration = duration;

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
		 * The strength of weak and strong glitches.
		 *
		 * @type {Vector2}
		 * @deprecated Use minStrength and maxStrength instead.
		 */

		this.strength = strength;

		/**
		 * The effect mode.
		 *
		 * @type {GlitchMode}
		 */

		this.mode = GlitchMode.SPORADIC;

		/**
		 * The ratio between weak (0.0) and strong (1.0) glitches. Range is [0.0, 1.0].
		 *
		 * This value is currently being treated as a threshold for strong glitches, i.e. it's inverted.
		 *
		 * TODO Resolve inversion.
		 * @type {Number}
		 */

		this.ratio = ratio;

		/**
		 * The chromatic aberration offset.
		 *
		 * @type {Vector2}
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
	 */

	get active() {

		return this.uniforms.get("active").value;

	}

	/**
	 * Indicates whether the glitch effect is currently active.
	 *
	 * @deprecated Use active instead.
	 * @return {Boolean} Whether the glitch effect is active.
	 */

	isActive() {

		return this.active;

	}

	/**
	 * The minimum delay between glitch activations.
	 *
	 * @type {Number}
	 */

	get minDelay() {

		return this.delay.x;

	}

	set minDelay(value) {

		this.delay.x = value;

	}

	/**
	 * Returns the minimum delay between glitch activations.
	 *
	 * @deprecated Use minDelay instead.
	 * @return {Number} The minimum delay in seconds.
	 */

	getMinDelay() {

		return this.delay.x;

	}

	/**
	 * Sets the minimum delay between glitch activations.
	 *
	 * @deprecated Use minDelay instead.
	 * @param {Number} value - The minimum delay in seconds.
	 */

	setMinDelay(value) {

		this.delay.x = value;

	}

	/**
	 * The maximum delay between glitch activations.
	 *
	 * @type {Number}
	 */

	get maxDelay() {

		return this.delay.y;

	}

	set maxDelay(value) {

		this.delay.y = value;

	}

	/**
	 * Returns the maximum delay between glitch activations.
	 *
	 * @deprecated Use maxDelay instead.
	 * @return {Number} The maximum delay in seconds.
	 */

	getMaxDelay() {

		return this.delay.y;

	}

	/**
	 * Sets the maximum delay between glitch activations.
	 *
	 * @deprecated Use maxDelay instead.
	 * @param {Number} value - The maximum delay in seconds.
	 */

	setMaxDelay(value) {

		this.delay.y = value;

	}

	/**
	 * The minimum duration of sporadic glitches.
	 *
	 * @type {Number}
	 */

	get minDuration() {

		return this.duration.x;

	}

	set minDuration(value) {

		this.duration.x = value;

	}

	/**
	 * Returns the minimum duration of sporadic glitches.
	 *
	 * @deprecated Use minDuration instead.
	 * @return {Number} The minimum duration in seconds.
	 */

	getMinDuration() {

		return this.duration.x;

	}

	/**
	 * Sets the minimum duration of sporadic glitches.
	 *
	 * @deprecated Use minDuration instead.
	 * @param {Number} value - The minimum duration in seconds.
	 */

	setMinDuration(value) {

		this.duration.x = value;

	}

	/**
	 * The maximum duration of sporadic glitches.
	 *
	 * @type {Number}
	 */

	get maxDuration() {

		return this.duration.y;

	}

	set maxDuration(value) {

		this.duration.y = value;

	}

	/**
	 * Returns the maximum duration of sporadic glitches.
	 *
	 * @deprecated Use maxDuration instead.
	 * @return {Number} The maximum duration in seconds.
	 */

	getMaxDuration() {

		return this.duration.y;

	}

	/**
	 * Sets the maximum duration of sporadic glitches.
	 *
	 * @deprecated Use maxDuration instead.
	 * @param {Number} value - The maximum duration in seconds.
	 */

	setMaxDuration(value) {

		this.duration.y = value;

	}

	/**
	 * The strength of weak glitches.
	 *
	 * @type {Number}
	 */

	get minStrength() {

		return this.strength.x;

	}

	set minStrength(value) {

		this.strength.x = value;

	}

	/**
	 * Returns the strength of weak glitches.
	 *
	 * @deprecated Use minStrength instead.
	 * @return {Number} The strength.
	 */

	getMinStrength() {

		return this.strength.x;

	}

	/**
	 * Sets the strength of weak glitches.
	 *
	 * @deprecated Use minStrength instead.
	 * @param {Number} value - The strength.
	 */

	setMinStrength(value) {

		this.strength.x = value;

	}

	/**
	 * The strength of strong glitches.
	 *
	 * @type {Number}
	 */

	get maxStrength() {

		return this.strength.y;

	}

	set maxStrength(value) {

		this.strength.y = value;

	}

	/**
	 * Returns the strength of strong glitches.
	 *
	 * @deprecated Use maxStrength instead.
	 * @return {Number} The strength.
	 */

	getMaxStrength() {

		return this.strength.y;

	}

	/**
	 * Sets the strength of strong glitches.
	 *
	 * @deprecated Use maxStrength instead.
	 * @param {Number} value - The strength.
	 */

	setMaxStrength(value) {

		this.strength.y = value;

	}

	/**
	 * Returns the current glitch mode.
	 *
	 * @deprecated Use mode instead.
	 * @return {GlitchMode} The mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the current glitch mode.
	 *
	 * @deprecated Use mode instead.
	 * @param {GlitchMode} value - The mode.
	 */

	setMode(value) {

		this.mode = value;

	}

	/**
	 * Returns the glitch ratio.
	 *
	 * @deprecated Use ratio instead.
	 * @return {Number} The ratio.
	 */

	getGlitchRatio() {

		return (1.0 - this.ratio);

	}

	/**
	 * Sets the ratio of weak (0.0) and strong (1.0) glitches.
	 *
	 * @deprecated Use ratio instead.
	 * @param {Number} value - The ratio. Range is [0.0, 1.0].
	 */

	setGlitchRatio(value) {

		this.ratio = Math.min(Math.max(1.0 - value, 0.0), 1.0);

	}

	/**
	 * The glitch column size.
	 *
	 * @type {Number}
	 */

	get columns() {

		return this.uniforms.get("columns").value;

	}

	set columns(value) {

		this.uniforms.get("columns").value = value;

	}

	/**
	 * Returns the glitch column size.
	 *
	 * @deprecated Use columns instead.
	 * @return {Number} The glitch column size.
	 */

	getGlitchColumns() {

		return this.columns;

	}

	/**
	 * Sets the glitch column size.
	 *
	 * @deprecated Use columns instead.
	 * @param {Number} value - The glitch column size.
	 */

	setGlitchColumns(value) {

		this.columns = value;

	}

	/**
	 * Returns the chromatic aberration offset.
	 *
	 * @deprecated Use chromaticAberrationOffset instead.
	 * @return {Vector2} The offset.
	 */

	getChromaticAberrationOffset() {

		return this.chromaticAberrationOffset;

	}

	/**
	 * Sets the chromatic aberration offset.
	 *
	 * @deprecated Use chromaticAberrationOffset instead.
	 * @param {Vector2} value - The offset.
	 */

	setChromaticAberrationOffset(value) {

		this.chromaticAberrationOffset = value;

	}

	/**
	 * The perturbation map.
	 *
	 * @type {Texture}
	 */

	get perturbationMap() {

		return this.uniforms.get("perturbationMap").value;

	}

	set perturbationMap(value) {

		const currentMap = this.perturbationMap;

		if(currentMap !== null && currentMap.name === textureTag) {

			currentMap.dispose();

		}

		value.minFilter = value.magFilter = NearestFilter;
		value.wrapS = value.wrapT = RepeatWrapping;
		value.generateMipmaps = false;

		this.uniforms.get("perturbationMap").value = value;

	}

	/**
	 * Returns the current perturbation map.
	 *
	 * @deprecated Use perturbationMap instead.
	 * @return {Texture} The current perturbation map.
	 */

	getPerturbationMap() {

		return this.perturbationMap;

	}

	/**
	 * Replaces the current perturbation map with the given one.
	 *
	 * The current map will be disposed if it was generated by this effect.
	 *
	 * @deprecated Use perturbationMap instead.
	 * @param {Texture} value - The new perturbation map.
	 */

	setPerturbationMap(value) {

		this.perturbationMap = value;

	}

	/**
	 * Generates a perturbation map.
	 *
	 * @deprecated Use NoiseTexture instead.
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

	/**
	 * Deletes generated resources.
	 */

	dispose() {

		const map = this.perturbationMap;

		if(map !== null && map.name === textureTag) {

			map.dispose();

		}

	}

}
