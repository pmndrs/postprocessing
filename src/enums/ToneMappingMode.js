/**
 * A tone mapping mode enumeration.
 *
 * @type {Object}
 * @property {Number} LINEAR - No tone mapping, only exposure.
 * @property {Number} REINHARD - Simple Reinhard tone mapping.
 * @property {Number} REINHARD2 - Modified Reinhard tone mapping.
 * @property {Number} REINHARD2_ADAPTIVE - Simulates the optic nerve responding to the amount of light it is receiving.
 * @property {Number} UNCHARTED2 - Uncharted 2 tone mapping. http://filmicworlds.com/blog/filmic-tonemapping-operators.
 * @property {Number} OPTIMIZED_CINEON - Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
 * @property {Number} ACES_FILMIC - ACES tone mapping with a scale of 1.0/0.6.
 * @property {Number} AGX - Filmic tone mapping. Requires three r160 or higher. https://github.com/EaryChow/AgX.
 */

export const ToneMappingMode = {
	LINEAR: 0,
	REINHARD: 1,
	REINHARD2: 2,
	REINHARD2_ADAPTIVE: 3,
	UNCHARTED2: 4,
	OPTIMIZED_CINEON: 5,
	ACES_FILMIC: 6,
	AGX: 7
};
