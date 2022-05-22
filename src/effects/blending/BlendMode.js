import { EventDispatcher, Uniform } from "three";
import { BlendFunction } from "../../enums";

import addBlendFunction from "./glsl/add.frag";
import alphaBlendFunction from "./glsl/alpha.frag";
import averageBlendFunction from "./glsl/average.frag";
import colorBurnBlendFunction from "./glsl/color-burn.frag";
import colorDodgeBlendFunction from "./glsl/color-dodge.frag";
import darkenBlendFunction from "./glsl/darken.frag";
import differenceBlendFunction from "./glsl/difference.frag";
import divideBlendFunction from "./glsl/divide.frag";
import exclusionBlendFunction from "./glsl/exclusion.frag";
import lightenBlendFunction from "./glsl/lighten.frag";
import multiplyBlendFunction from "./glsl/multiply.frag";
import negationBlendFunction from "./glsl/negation.frag";
import normalBlendFunction from "./glsl/normal.frag";
import overlayBlendFunction from "./glsl/overlay.frag";
import reflectBlendFunction from "./glsl/reflect.frag";
import setBlendFunction from "./glsl/set.frag";
import screenBlendFunction from "./glsl/screen.frag";
import softLightBlendFunction from "./glsl/soft-light.frag";
import subtractBlendFunction from "./glsl/subtract.frag";

/**
 * A blend function shader code catalogue.
 *
 * @type {Map<BlendFunction, String>}
 * @private
 */

const blendFunctions = new Map([
	[BlendFunction.SKIP, null],
	[BlendFunction.ADD, addBlendFunction],
	[BlendFunction.ALPHA, alphaBlendFunction],
	[BlendFunction.AVERAGE, averageBlendFunction],
	[BlendFunction.COLOR_BURN, colorBurnBlendFunction],
	[BlendFunction.COLOR_DODGE, colorDodgeBlendFunction],
	[BlendFunction.DARKEN, darkenBlendFunction],
	[BlendFunction.DIFFERENCE, differenceBlendFunction],
	[BlendFunction.DIVIDE, divideBlendFunction],
	[BlendFunction.EXCLUSION, exclusionBlendFunction],
	[BlendFunction.LIGHTEN, lightenBlendFunction],
	[BlendFunction.MULTIPLY, multiplyBlendFunction],
	[BlendFunction.NEGATION, negationBlendFunction],
	[BlendFunction.NORMAL, normalBlendFunction],
	[BlendFunction.OVERLAY, overlayBlendFunction],
	[BlendFunction.REFLECT, reflectBlendFunction],
	[BlendFunction.SET, setBlendFunction],
	[BlendFunction.SCREEN, screenBlendFunction],
	[BlendFunction.SOFT_LIGHT, softLightBlendFunction],
	[BlendFunction.SUBTRACT, subtractBlendFunction]
]);

/**
 * A blend mode.
 */

export class BlendMode extends EventDispatcher {

	/**
	 * Constructs a new blend mode.
	 *
	 * @param {BlendFunction} blendFunction - The blend function.
	 * @param {Number} opacity - The opacity of the color that will be blended with the base color.
	 */

	constructor(blendFunction, opacity = 1.0) {

		super();

		/**
		 * The blend function.
		 *
		 * @type {BlendFunction}
		 * @private
		 */

		this.f = blendFunction;

		/**
		 * A uniform that controls the opacity of this blend mode.
		 *
		 * TODO Add opacity accessors for uniform value.
		 * @type {Uniform}
		 */

		this.opacity = new Uniform(opacity);

	}

	/**
	 * Returns the opacity.
	 *
	 * @return {Number} The opacity.
	 */

	getOpacity() {

		return this.opacity.value;

	}

	/**
	 * Sets the opacity.
	 *
	 * @param {Number} value - The opacity.
	 */

	setOpacity(value) {

		this.opacity.value = value;

	}

	/**
	 * The blend function.
	 *
	 * @type {BlendFunction}
	 */

	get blendFunction() {

		return this.f;

	}

	set blendFunction(value) {

		this.f = value;
		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Returns the blend function.
	 *
	 * @deprecated Use blendFunction instead.
	 * @return {BlendFunction} The blend function.
	 */

	getBlendFunction() {

		return this.blendFunction;

	}

	/**
	 * Sets the blend function.
	 *
	 * @deprecated Use blendFunction instead.
	 * @param {BlendFunction} value - The blend function.
	 */

	setBlendFunction(value) {

		this.blendFunction = value;

	}

	/**
	 * Returns the blend function shader code.
	 *
	 * @return {String} The blend function shader code.
	 */

	getShaderCode() {

		return blendFunctions.get(this.blendFunction);

	}

}
