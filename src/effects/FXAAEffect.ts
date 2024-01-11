import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/fxaa.frag";
import vertexShader from "./shaders/fxaa.vert";

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
	 */

	constructor() {

		super("FXAAEffect");

		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;

		this.minEdgeThreshold = 0.0312;
		this.maxEdgeThreshold = 0.125;
		this.subpixelQuality = 0.75;
		this.samples = 12;

	}

	/**
	 * The minimum edge detection threshold. Range is [0.0, 1.0].
	 */

	get minEdgeThreshold(): number {

		return this.input.defines.get("EDGE_THRESHOLD_MIN") as number;

	}

	set minEdgeThreshold(value: number) {

		this.input.defines.set("EDGE_THRESHOLD_MIN", value);
		this.setChanged();

	}

	/**
	 * The maximum edge detection threshold. Range is [0.0, 1.0].
	 */

	get maxEdgeThreshold(): number {

		return this.input.defines.get("EDGE_THRESHOLD_MAX") as number;

	}

	set maxEdgeThreshold(value: number) {

		this.input.defines.set("EDGE_THRESHOLD_MAX", value);
		this.setChanged();

	}

	/**
	 * The subpixel blend quality. Range is [0.0, 1.0].
	 */

	get subpixelQuality(): number {

		return this.input.defines.get("SUBPIXEL_QUALITY") as number;

	}

	set subpixelQuality(value: number) {

		this.input.defines.set("SUBPIXEL_QUALITY", value);
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
