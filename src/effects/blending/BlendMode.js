import { EventDispatcher, Uniform } from "three";
import { BlendFunction } from "../../enums/BlendFunction.js";

import add from "./glsl/add.frag";
import alpha from "./glsl/alpha.frag";
import average from "./glsl/average.frag";
import color from "./glsl/color.frag";
import colorBurn from "./glsl/color-burn.frag";
import colorDodge from "./glsl/color-dodge.frag";
import darken from "./glsl/darken.frag";
import difference from "./glsl/difference.frag";
import divide from "./glsl/divide.frag";
import exclusion from "./glsl/exclusion.frag";
import hardLight from "./glsl/hard-light.frag";
import hardMix from "./glsl/hard-mix.frag";
import hue from "./glsl/hue.frag";
import invert from "./glsl/invert.frag";
import invertRGB from "./glsl/invert-rgb.frag";
import lighten from "./glsl/lighten.frag";
import linearBurn from "./glsl/linear-burn.frag";
import linearDodge from "./glsl/linear-dodge.frag";
import linearLight from "./glsl/linear-light.frag";
import luminosity from "./glsl/luminosity.frag";
import multiply from "./glsl/multiply.frag";
import negation from "./glsl/negation.frag";
import normal from "./glsl/normal.frag";
import overlay from "./glsl/overlay.frag";
import pinLight from "./glsl/pin-light.frag";
import reflect from "./glsl/reflect.frag";
import saturation from "./glsl/saturation.frag";
import screen from "./glsl/screen.frag";
import softLight from "./glsl/soft-light.frag";
import src from "./glsl/src.frag";
import subtract from "./glsl/subtract.frag";
import vividLight from "./glsl/vivid-light.frag";

/**
 * A blend function shader code catalogue.
 *
 * @type {Map<BlendFunction, String>}
 * @private
 */

const blendFunctions = new Map([
	[BlendFunction.ADD, add],
	[BlendFunction.ALPHA, alpha],
	[BlendFunction.AVERAGE, average],
	[BlendFunction.COLOR, color],
	[BlendFunction.COLOR_BURN, colorBurn],
	[BlendFunction.COLOR_DODGE, colorDodge],
	[BlendFunction.DARKEN, darken],
	[BlendFunction.DIFFERENCE, difference],
	[BlendFunction.DIVIDE, divide],
	[BlendFunction.DST, null],
	[BlendFunction.EXCLUSION, exclusion],
	[BlendFunction.HARD_LIGHT, hardLight],
	[BlendFunction.HARD_MIX, hardMix],
	[BlendFunction.HUE, hue],
	[BlendFunction.INVERT, invert],
	[BlendFunction.INVERT_RGB, invertRGB],
	[BlendFunction.LIGHTEN, lighten],
	[BlendFunction.LINEAR_BURN, linearBurn],
	[BlendFunction.LINEAR_DODGE, linearDodge],
	[BlendFunction.LINEAR_LIGHT, linearLight],
	[BlendFunction.LUMINOSITY, luminosity],
	[BlendFunction.MULTIPLY, multiply],
	[BlendFunction.NEGATION, negation],
	[BlendFunction.NORMAL, normal],
	[BlendFunction.OVERLAY, overlay],
	[BlendFunction.PIN_LIGHT, pinLight],
	[BlendFunction.REFLECT, reflect],
	[BlendFunction.SATURATION, saturation],
	[BlendFunction.SCREEN, screen],
	[BlendFunction.SOFT_LIGHT, softLight],
	[BlendFunction.SRC, src],
	[BlendFunction.SUBTRACT, subtract],
	[BlendFunction.VIVID_LIGHT, vividLight]
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
		 * Backing data for {@link blendFunction}.
		 *
		 * @type {BlendFunction}
		 * @private
		 */

		this._blendFunction = blendFunction;

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

		return this._blendFunction;

	}

	set blendFunction(value) {

		this._blendFunction = value;
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
