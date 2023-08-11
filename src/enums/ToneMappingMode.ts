/**
 * A tone mapping mode enumeration.
 *
 * @group Enums
 */

export enum ToneMappingMode {

	/**
	 * Simple Reinhard tone mapping.
	 */

	REINHARD,

	/**
	 * Modified Reinhard tone mapping.
	 */

	REINHARD2,

	/**
	 * Simulates the optic nerve responding to the amount of light it is receiving.
	 */

	REINHARD2_ADAPTIVE,

	/**
	 * Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
	 */

	OPTIMIZED_CINEON,

	/**
	 * ACES tone mapping with a scale of 1.0/0.6.
	 */

	ACES_FILMIC,

	/**
	 * Uncharted 2 tone mapping.
	 *
	 * @see http://filmicworlds.com/blog/filmic-tonemapping-operators
	 */

	UNCHARTED2

}
