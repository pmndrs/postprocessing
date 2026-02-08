import { Uniform } from "three";
import { AddBlendFunction } from "./blending/blend-functions/AddBlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/noise.frag";

/**
 * A noise effect options
 *
 * @category Effects
 */

export interface NoiseEffectOptions {

	/**
	 * Enables or disables RGB noise.
	 *
	 * @defaultValue true
	 */

	rgb?: boolean;

	/**
	 * Controls whether the noise should be multiplied with the input colors prior to blending.
	 *
	 * @defaultValue true
	 */

	premultiply?: boolean;

	/**
	 * The animation update rate expressed in frames per second.
	 *
	 * This value does not affect performance. The update rate is limited by the actual frame rate.
	 *
	 * @defaultValue 24
	 */

	fps?: number;

}

/**
 * A noise effect.
 *
 * @see https://www.shadertoy.com/view/w3B3Wz
 * @category Effects
 */

export class NoiseEffect extends Effect implements NoiseEffectOptions {

	/**
	 * @see {@link fps}
	 */

	private _fps: number;

	/**
	 * The animation update timeout in seconds.
	 */

	private timeout: number;

	/**
	 * A time accumulator.
	 */

	private acc: number;

	/**
	 * Constructs a new noise effect.
	 */

	constructor({
		rgb = true,
		premultiply = true,
		fps = 24
	}: NoiseEffectOptions = {}) {

		super("NoiseEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new AddBlendFunction();

		this.input.defines.set("SEED", Math.max(1, Math.round(Math.random() * 1000)).toFixed(1));
		this.input.uniforms.set("page", new Uniform(0.0));

		this._fps = 0;
		this.timeout = 0.0;
		this.acc = 0.0;

		this.rgb = rgb;
		this.premultiply = premultiply;
		this.fps = fps;

	}

	/**
	 * The current noise page.
	 */

	private get page(): number {

		return this.input.uniforms.get("page")!.value as number;

	}

	private set page(value: number) {

		this.input.uniforms.get("page")!.value = value;

	}

	get fps(): number {

		return this._fps;

	}

	set fps(value: number) {

		this._fps = value;
		this.timeout = (value !== 0.0) ? 1.0 / value : 0.0;

	}

	get rgb(): boolean {

		return this.input.defines.has("RGB");

	}

	set rgb(value: boolean) {

		if(this.rgb !== value) {

			if(value) {

				this.input.defines.set("RGB", true);

			} else {

				this.input.defines.delete("RGB");

			}

			this.setChanged();

		}

	}

	get premultiply(): boolean {

		return this.input.defines.has("PREMULTIPLY");

	}

	set premultiply(value: boolean) {

		if(this.premultiply !== value) {

			if(value) {

				this.input.defines.set("PREMULTIPLY", true);

			} else {

				this.input.defines.delete("PREMULTIPLY");

			}

			this.setChanged();

		}

	}

	override render(): void {

		if(this.timer === null || this.fps === 0) {

			return;

		}

		this.acc += this.timer.getDelta();

		if(this.acc >= this.timeout) {

			this.page = (this.page + 1.0) % 1000.0;
			this.acc = 0.0;

		}

	}

}
