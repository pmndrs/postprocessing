import { Uniform } from "three";
import { BlendFunction } from "./BlendFunction.js";

import addBlendFunction from "./glsl/add/shader.frag";
import averageBlendFunction from "./glsl/average/shader.frag";
import darkenBlendFunction from "./glsl/darken/shader.frag";
import lightenBlendFunction from "./glsl/lighten/shader.frag";
import normalBlendFunction from "./glsl/normal/shader.frag";
import screenBlendFunction from "./glsl/screen/shader.frag";

/**
 * A blend function shader code catalogue.
 *
 * @type {Map<BlendFunction, String>}
 * @private
 */

const blendFunctions = new Map([
	[BlendFunction.SKIP, null],
	[BlendFunction.ADD, addBlendFunction],
	[BlendFunction.AVERAGE, averageBlendFunction],
	[BlendFunction.DARKEN, darkenBlendFunction],
	[BlendFunction.LIGHTEN, lightenBlendFunction],
	[BlendFunction.NORMAL, normalBlendFunction],
	[BlendFunction.SCREEN, screenBlendFunction]
]);

/**
 * A blend mode.
 */

export class BlendMode {

	/**
	 * Constructs a new blend mode.
	 *
	 * @param {BlendFunction} blendFunction - The blend function to use.
	 * @param {Number} opacity - The opacity of the color that will be blended with the base color.
	 */

	constructor(blendFunction, opacity = 1.0) {

		/**
		 * The blend function.
		 *
		 * @type {BlendFunction}
		 */

		this.blendFunction = blendFunction;

		/**
		 * The opacity of the color that will be blended with the base color.
		 *
		 * @type {Uniform}
		 */

		this.opacity = new Uniform(opacity);

	}

	/**
	 * Returns the blend function shader code.
	 *
	 * @type {String}
	 */

	getShaderCode() {

		return blendFunctions.get(this.blendFunction);

	}

}
