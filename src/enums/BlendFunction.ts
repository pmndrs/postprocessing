/**
 * An enumeration of blend functions.
 *
 * @see https://www.khronos.org/registry/OpenGL/extensions/NV/NV_blend_equation_advanced.txt
 * @group Enums
 */

export enum BlendFunction {

	/**
	 * Additive blending. Supports HDR.
	 */

	ADD = 0,

	/**
	 * Blends based on the alpha value of the new color. Supports HDR.
	 */

	ALPHA = 1,

	/**
	 * Calculates the avarage of the new color and the base color. Supports HDR.
	 */

	AVERAGE = 2,

	/**
	 * Converts the colors to HSL and blends based on color.
	 */

	COLOR = 3,

	/**
	 * Color burn.
	 */

	COLOR_BURN = 4,

	/**
	 * Color dodge.
	 */

	COLOR_DODGE = 5,

	/**
	 * Prioritizes darker colors. Supports HDR.
	 */

	DARKEN = 6,

	/**
	 * Color difference. Supports HDR.
	 */

	DIFFERENCE = 7,

	/**
	 * Color division. Supports HDR.
	 */

	DIVIDE = 8,

	/**
	 * Overwrites the new color with the base color while ignoring opacity. Supports HDR.
	 */

	DST = 9,

	/**
	 * Color exclusion.
	 */

	EXCLUSION = 10,

	/**
	 * Hard light.
	 */

	HARD_LIGHT = 11,

	/**
	 * Hard mix.
	 */

	HARD_MIX = 12,

	/**
	 * Converts the colors to HSL and blends based on hue.
	 */

	HUE = 13,

	/**
	 * Overwrites the base color with the inverted new color.
	 */

	INVERT = 14,

	/**
	 * Multiplies the new color with the inverted base color.
	 */

	INVERT_RGB = 15,

	/**
	 * Prioritizes lighter colors. Supports HDR.
	 */

	LIGHTEN = 16,

	/**
	 * Linear burn.
	 */

	LINEAR_BURN = 17,

	/**
	 * Same as ADD but limits the result to 1.Same as ADD but limits the result to 1.
	 */

	LINEAR_DODGE = 18,

	/**
	 * Linear light.
	 */

	LINEAR_LIGHT = 19,

	/**
	 * Converts the colors to HSL and blends based on luminosity.
	 */

	LUMINOSITY = 20,

	/**
	 * Color multiplication. Supports HDR.
	 */

	MULTIPLY = 21,

	/**
	 * Negates the base color using the new color.
	 */

	NEGATION = 22,

	/**
	 * Overwrites the base color with the new one. Supports HDR.
	 */

	NORMAL = 23,

	/**
	 * Color overlay.
	 */

	OVERLAY = 24,

	/**
	 * Pin light.
	 */

	PIN_LIGHT = 25,

	/**
	 * Color reflection.
	 */

	REFLECT = 26,

	/**
	 * Screen blending. The two colors are effectively projected on a white screen simultaneously.
	 */

	SATURATION = 27,

	/**
	 * Overwrites the base color with the new one while ignoring opacity. Supports HDR.
	 */

	SCREEN = 28,

	/**
	 * Converts the colors to HSL and blends based on saturation.
	 */

	SOFT_LIGHT = 29,

	/**
	 * Soft light.
	 */

	SRC = 30,

	/**
	 * Subtracts the new color from the base color.
	 */

	SUBTRACT = 31,

	/**
	 * Vivid light.
	 */

	VIVID_LIGHT = 32

}
