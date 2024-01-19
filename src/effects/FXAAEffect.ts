import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/fxaa.frag";
import vertexShader from "./shaders/fxaa.vert";

/**
 * FXAAEffect options.
 *
 * @category Effects
 */

export interface FXAAEffectOptions {

	/**
	 * The minimum edge detection threshold. Range is [0.0, 1.0].
	 *
	 * @defaultValue 0.0312
	 */

	minEdgeThreshold?: number;

	/**
	 * The maximum edge detection threshold. Range is [0.0, 1.0].
	 *
	 * @defaultValue 0.125
	 */

	maxEdgeThreshold?: number;

	/**
	 * The subpixel blend quality. Range is [0.0, 1.0].
	 *
	 * @defaultValue 0.75
	 */

	subpixelQuality?: number;

	/**
	 * The maximum amount of edge detection samples.
	 *
	 * @defaultValue 12
	 */

	samples?: number;

}

/**
 * NVIDIA FXAA 3.11 by Timothy Lottes:
 * https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
 *
 * Based on an implementation by Simon Rodriguez:
 * https://github.com/kosua20/Rendu/blob/master/resources/common/shaders/screens/fxaa.frag
 *
 * @category Effects
 */

export class FXAAEffect extends Effect {

	/**
	 * Constructs a new FXAA effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		minEdgeThreshold = 0.0312,
		maxEdgeThreshold = 0.125,
		subpixelQuality = 0.75,
		samples = 12
	}: FXAAEffectOptions = {}) {

		super("FXAAEffect");

		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;

		this.minEdgeThreshold = minEdgeThreshold;
		this.maxEdgeThreshold = maxEdgeThreshold;
		this.subpixelQuality = subpixelQuality;
		this.samples = samples;

	}

	/**
	 * The minimum edge detection threshold. Range is [0.0, 1.0].
	 */

	get minEdgeThreshold(): number {

		return Number(this.input.defines.get("EDGE_THRESHOLD_MIN"));

	}

	set minEdgeThreshold(value: number) {

		this.input.defines.set("EDGE_THRESHOLD_MIN", value.toFixed(9));
		this.setChanged();

	}

	/**
	 * The maximum edge detection threshold. Range is [0.0, 1.0].
	 */

	get maxEdgeThreshold(): number {

		return Number(this.input.defines.get("EDGE_THRESHOLD_MAX"));

	}

	set maxEdgeThreshold(value: number) {

		this.input.defines.set("EDGE_THRESHOLD_MAX", value.toFixed(9));
		this.setChanged();

	}

	/**
	 * The subpixel blend quality. Range is [0.0, 1.0].
	 */

	get subpixelQuality(): number {

		return Number(this.input.defines.get("SUBPIXEL_QUALITY"));

	}

	set subpixelQuality(value: number) {

		this.input.defines.set("SUBPIXEL_QUALITY", value.toFixed(9));
		this.setChanged();

	}

	/**
	 * The maximum amount of edge detection samples.
	 */

	get samples(): number {

		return this.input.defines.get("SAMPLES") as number;

	}

	set samples(value: number) {

		this.input.defines.set("SAMPLES", value);
		this.setChanged();

	}

}