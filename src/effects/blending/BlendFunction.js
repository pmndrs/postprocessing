/**
 * A blend function enumeration.
 *
 * @type {Object}
 * @property {Number} SKIP - No blending. The effect will not be included in the final shader.
 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
 * @property {Number} AVERAGE - Average blending.
 * @property {Number} DARKEN - Prioritize darker colors.
 * @property {Number} LIGHTER - Prioritize lighter colors.
 * @property {Number} NORMAL - Normal blending. The new color overwrites the old one.
 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
 */

export const BlendFunction = {

	SKIP: 0,
	ADD: 1,
	AVERAGE: 2,
	DARKEN: 3,
	LIGHTEN: 4,
	NORMAL: 5,
	SCREEN: 6

};
