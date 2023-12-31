/**
 * An enumeration of tone mapping techniques.
 *
 * @group Enums
 */

export enum ToneMapping {

	/**
	 * Basic Reinhard tone mapping.
	 */

	REINHARD,

	/**
	 * Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
	 */

	OPTIMIZED_CINEON,

	/**
	 * ACES filmic tone mapping with a scale of 1.0/0.6.
	 */

	ACES_FILMIC,

	/**
	 * Filmic tone mapping.
	 *
	 * @see https://github.com/EaryChow/AgX
	 */

	AGX

}
