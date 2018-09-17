/**
 * A blend function enumeration.
 *
 * @type {Object}
 * @property {Number} SKIP - No blending. The effect will not be included in the final shader.
 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
 * @property {Number} AVERAGE - Average blending.
 * @property {Number} COLOR_BURN - Color dodge.
 * @property {Number} COLOR_DODGE - Color burn.
 * @property {Number} DARKEN - Prioritize darker colors.
 * @property {Number} DIFFERENCE - Color difference.
 * @property {Number} EXCLUSION - Color exclusion.
 * @property {Number} LIGHTEN - Prioritize lighter colors.
 * @property {Number} MULTIPLY - Color multiplication.
 * @property {Number} NEGATION - Color negation.
 * @property {Number} NORMAL - Normal blending. The new color overwrites the old one.
 * @property {Number} OVERLAY - Color overlay.
 * @property {Number} REFLECT - Color reflection.
 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
 * @property {Number} SOFT_LIGHT - Soft light blending.
 * @property {Number} SUBTRACT - Color subtraction.
 */

export const BlendFunction = {

	SKIP: 0,
	ADD: 1,
	AVERAGE: 2,
	COLOR_BURN: 3,
	COLOR_DODGE: 4,
	DARKEN: 5,
	DIFFERENCE: 6,
	EXCLUSION: 7,
	LIGHTEN: 8,
	MULTIPLY: 9,
	NEGATION: 10,
	NORMAL: 11,
	OVERLAY: 12,
	REFLECT: 13,
	SCREEN: 14,
	SOFT_LIGHT: 15,
	SUBTRACT: 16

};
