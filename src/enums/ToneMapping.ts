/**
 * An enumeration of tone mapping techniques.
 *
 * @category Enums
 * @see https://64.github.io/tonemapping
 */

export enum ToneMapping {

	/**
	 * No tone mapping, only exposure. Colors will be clamped to the output range.
	 */

	LINEAR,

	/**
	 * Basic Reinhard tone mapping.
	 *
	 * @see https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
	 */

	REINHARD,

	/**
	 * Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
	 *
	 * @see http://filmicworlds.com/blog/filmic-tonemapping-operators
	 */

	OPTIMIZED_CINEON,

	/**
	 * ACES filmic tone mapping with a scale of 1.0/0.6.
	 */

	ACES_FILMIC,

	/**
	 * Filmic tone mapping based on Blender's implementation using rec 2020 primaries.
	 *
	 * @see https://github.com/EaryChow/AgX
	 */

	AGX,

	/**
	 * Neutral tone mapping by Khronos.
	 *
	 * @see https://modelviewer.dev/examples/tone-mapping
	 */

	NEUTRAL

}
