/**
 * A tone mapping enumeration.
 *
 * @group Enums
 */

export enum ToneMapping {

	/**
	 * Simple Reinhard tone mapping.
	 */

	REINHARD = 0,

	/**
	 * Modified Reinhard tone mapping.
	 */

	REINHARD2 = 1,

	/**
	 * Simulates the optic nerve responding to the amount of light it is receiving.
	 */

	REINHARD2_ADAPTIVE = 2,

	/**
	 * Uncharted 2 tone mapping.
	 *
	 * @see http://filmicworlds.com/blog/filmic-tonemapping-operators
	 */

	UNCHARTED2 = 3,

	/**
	 * Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
	 */

	OPTIMIZED_CINEON = 4,

	/**
	 * ACES filmic tone mapping with a scale of 1.0/0.6.
	 */

	ACES_FILMIC = 5,

	/**
	 * Filmic tone mapping.
	 *
	 * @see https://github.com/EaryChow/AgX
	 */

	AGX = 6

}
