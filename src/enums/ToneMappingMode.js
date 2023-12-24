/**
 * A tone mapping mode enumeration.
 *
 * @type {Object}
 * @property {Number} REINHARD - Simple Reinhard tone mapping.
 * @property {Number} REINHARD2 - Modified Reinhard tone mapping.
 * @property {Number} REINHARD2_ADAPTIVE - Simulates the optic nerve responding to the amount of light it is receiving.
 * @property {Number} OPTIMIZED_CINEON - Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
 * @property {Number} UNCHARTED2 - Uncharted 2 tone mapping. http://filmicworlds.com/blog/filmic-tonemapping-operators.
 * @property {Number} ACES_FILMIC - ACES tone mapping with a scale of 1.0/0.6.
 * @property {Number} AGX - Filmic tone mapping. Requires three r160 or higher. https://github.com/EaryChow/AgX.
 */

export const ToneMappingMode = {
	REINHARD: 0,
	REINHARD2: 1,
	REINHARD2_ADAPTIVE: 2,
	UNCHARTED2: 3,
	OPTIMIZED_CINEON: 4,
	ACES_FILMIC: 5,
	AGX: 6
};
