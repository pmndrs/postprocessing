import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/fxaa.frag";
import vertexShader from "./glsl/fxaa.vert";

/**
 * NVIDIA FXAA 3.11 by Timothy Lottes:
 * https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
 *
 * Based on an implementation by Simon Rodriguez:
 * https://github.com/kosua20/Rendu/blob/master/resources/common/shaders/screens/fxaa.frag
 */

export class FXAAEffect extends Effect {

	/**
	 * Constructs a new FXAA effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 */

	constructor({ blendFunction = BlendFunction.SRC } = {}) {

		super("FXAAEffect", fragmentShader, {
			vertexShader,
			blendFunction,
			defines: new Map([
				["EDGE_THRESHOLD_MIN", "0.0312"],
				["EDGE_THRESHOLD_MAX", "0.125"],
				["SUBPIXEL_QUALITY", "0.75"],
				["SAMPLES", "12"]
			])
		});

	}

	/**
	 * The minimum edge detection threshold. Range is [0.0, 1.0].
	 *
	 * @type {Number}
	 */

	get minEdgeThreshold() {

		return Number(this.defines.get("EDGE_THRESHOLD_MIN"));

	}

	set minEdgeThreshold(value) {

		this.defines.set("EDGE_THRESHOLD_MIN", value.toFixed(12));
		this.setChanged();

	}

	/**
	 * The maximum edge detection threshold. Range is [0.0, 1.0].
	 *
	 * @type {Number}
	 */

	get maxEdgeThreshold() {

		return Number(this.defines.get("EDGE_THRESHOLD_MAX"));

	}

	set maxEdgeThreshold(value) {

		this.defines.set("EDGE_THRESHOLD_MAX", value.toFixed(12));
		this.setChanged();

	}

	/**
	 * The subpixel blend quality. Range is [0.0, 1.0].
	 *
	 * @type {Number}
	 */

	get subpixelQuality() {

		return Number(this.defines.get("SUBPIXEL_QUALITY"));

	}

	set subpixelQuality(value) {

		this.defines.set("SUBPIXEL_QUALITY", value.toFixed(12));
		this.setChanged();

	}

	/**
	 * The maximum amount of edge detection samples.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number(this.defines.get("SAMPLES"));

	}

	set samples(value) {

		this.defines.set("SAMPLES", value.toFixed(0));
		this.setChanged();

	}

}
