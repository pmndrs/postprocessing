import { EventDispatcher, Uniform } from "three";
import { BlendFunction } from "../../enums/BlendFunction.js";

import add from "./shaders/add.frag";
import alpha from "./shaders/alpha.frag";
import average from "./shaders/average.frag";
import color from "./shaders/color.frag";
import colorBurn from "./shaders/color-burn.frag";
import colorDodge from "./shaders/color-dodge.frag";
import darken from "./shaders/darken.frag";
import difference from "./shaders/difference.frag";
import divide from "./shaders/divide.frag";
import exclusion from "./shaders/exclusion.frag";
import hardLight from "./shaders/hard-light.frag";
import hardMix from "./shaders/hard-mix.frag";
import hue from "./shaders/hue.frag";
import invert from "./shaders/invert.frag";
import invertRGB from "./shaders/invert-rgb.frag";
import lighten from "./shaders/lighten.frag";
import linearBurn from "./shaders/linear-burn.frag";
import linearDodge from "./shaders/linear-dodge.frag";
import linearLight from "./shaders/linear-light.frag";
import luminosity from "./shaders/luminosity.frag";
import multiply from "./shaders/multiply.frag";
import negation from "./shaders/negation.frag";
import normal from "./shaders/normal.frag";
import overlay from "./shaders/overlay.frag";
import pinLight from "./shaders/pin-light.frag";
import reflect from "./shaders/reflect.frag";
import saturation from "./shaders/saturation.frag";
import screen from "./shaders/screen.frag";
import softLight from "./shaders/soft-light.frag";
import src from "./shaders/src.frag";
import subtract from "./shaders/subtract.frag";
import vividLight from "./shaders/vivid-light.frag";

const blendFunctions = new Map<BlendFunction, string>([
	[BlendFunction.ADD, add],
	[BlendFunction.ALPHA, alpha],
	[BlendFunction.AVERAGE, average],
	[BlendFunction.COLOR, color],
	[BlendFunction.COLOR_BURN, colorBurn],
	[BlendFunction.COLOR_DODGE, colorDodge],
	[BlendFunction.DARKEN, darken],
	[BlendFunction.DIFFERENCE, difference],
	[BlendFunction.DIVIDE, divide],
	[BlendFunction.DST, ""],
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
 *
 * @group Effects
 */

export class BlendMode extends EventDispatcher {

	/**
	 * @see {@link blendFunction}
	 */

	private _blendFunction: BlendFunction;

	/**
	 * A uniform that controls the opacity of this blend mode.
	 *
	 * @see {@link opacity}
	 */

	readonly opacityUniform: Uniform;

	/**
	 * Constructs a new blend mode.
	 *
	 * @param blendFunction - The blend function.
	 * @param opacity - The opacity of the color that will be blended with the base color.
	 */

	constructor(blendFunction: BlendFunction, opacity = 1.0) {

		super();

		this._blendFunction = blendFunction;
		this.opacityUniform = new Uniform(opacity);

	}

	/**
	 * A convenience accessor for the opacity uniform value.
	 *
	 * @see {@link opacityUniform}
	 */

	get opacity(): number {

		return this.opacityUniform.value as number;

	}

	set opacity(value: number) {

		this.opacityUniform.value = value;

	}

	/**
	 * The blend function.
	 */

	get blendFunction() {

		return this._blendFunction;

	}

	set blendFunction(value) {

		this._blendFunction = value;
		this.dispatchEvent({ type: "change" });

	}

	/**
	 * The shader code of the current blend function.
	 */

	get shaderCode(): string {

		return blendFunctions.get(this.blendFunction) as string;

	}

}
