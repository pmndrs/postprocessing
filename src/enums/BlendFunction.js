/**
 * A blend function enumeration.
 *
 * Important: Do not use `BlendFunction.SKIP` to disable effects. See
 * [Enabling and Disabling Effects](https://github.com/vanruesc/postprocessing/wiki/Enabling-and-Disabling-Effects)
 * for more information.
 *
 * Based on https://www.khronos.org/registry/OpenGL/extensions/NV/NV_blend_equation_advanced.txt
 *
 * @type {Object}
 * @property {Number} SKIP - Deprecated. Use DST instead. Warning: This blend function does NOT fully disable the effect.
 * @property {Number} SET - Deprecated. Use SRC instead.
 * @property {Number} ADD - Additive blending. Supports HDR.
 * @property {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color. Supports HDR.
 * @property {Number} AVERAGE - Calculates the avarage of the new color and the base color. Supports HDR.
 * @property {Number} COLOR - Converts the colors to HSL and blends based on color.
 * @property {Number} COLOR_BURN - Color burn.
 * @property {Number} COLOR_DODGE - Color dodge.
 * @property {Number} DARKEN - Prioritize darker colors. Supports HDR.
 * @property {Number} DIFFERENCE - Color difference. Supports HDR.
 * @property {Number} DIVIDE - Color division. Supports HDR.
 * @property {Number} DST - Overwrites the new color with the base color while ignoring opacity. Supports HDR.
 * @property {Number} EXCLUSION - Color exclusion.
 * @property {Number} HARD_LIGHT - Hard light.
 * @property {Number} HARD_MIX - Hard mix.
 * @property {Number} HUE - Converts the colors to HSL and blends based on hue.
 * @property {Number} INVERT - Overwrites the base color with the inverted new color.
 * @property {Number} INVERT_RGB - Multiplies the new color with the inverted base color.
 * @property {Number} LIGHTEN - Prioritize lighter colors. Supports HDR.
 * @property {Number} LINEAR_BURN - Linear burn.
 * @property {Number} LINEAR_DODGE - Same as ADD but limits the result to 1.
 * @property {Number} LINEAR_LIGHT - Linear light.
 * @property {Number} LUMINOSITY - Converts the colors to HSL and blends based on luminosity.
 * @property {Number} MULTIPLY - Color multiplication. Supports HDR.
 * @property {Number} NEGATION - Negates the base color using the new color.
 * @property {Number} NORMAL - Overwrites the base color with the new one. Supports HDR.
 * @property {Number} OVERLAY - Color overlay.
 * @property {Number} PIN_LIGHT - Pin light.
 * @property {Number} REFLECT - Color reflection.
 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
 * @property {Number} SRC - Overwrites the base color with the new one while ignoring opacity. Supports HDR.
 * @property {Number} SATURATION - Converts the colors to HSL and blends based on saturation.
 * @property {Number} SOFT_LIGHT - Soft light.
 * @property {Number} SUBTRACT - Subtracts the new color from the base color.
 * @property {Number} VIVID_LIGHT - Vivid light.
 */

export const BlendFunction = {
	SKIP: 9,
	SET: 30,
	ADD: 0,
	ALPHA: 1,
	AVERAGE: 2,
	COLOR: 3,
	COLOR_BURN: 4,
	COLOR_DODGE: 5,
	DARKEN: 6,
	DIFFERENCE: 7,
	DIVIDE: 8,
	DST: 9,
	EXCLUSION: 10,
	HARD_LIGHT: 11,
	HARD_MIX: 12,
	HUE: 13,
	INVERT: 14,
	INVERT_RGB: 15,
	LIGHTEN: 16,
	LINEAR_BURN: 17,
	LINEAR_DODGE: 18,
	LINEAR_LIGHT: 19,
	LUMINOSITY: 20,
	MULTIPLY: 21,
	NEGATION: 22,
	NORMAL: 23,
	OVERLAY: 24,
	PIN_LIGHT: 25,
	REFLECT: 26,
	SATURATION: 27,
	SCREEN: 28,
	SOFT_LIGHT: 29,
	SRC: 30,
	SUBTRACT: 31,
	VIVID_LIGHT: 32
};
