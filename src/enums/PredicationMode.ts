/**
 * An enumeration of SMAA predication modes.
 *
 * @group Enums
 */

export enum PredicationMode {

	/**
	 * No predicated thresholding.
	 */

	DISABLED,

	/**
	 * Depth-based predicated thresholding.
	 */

	DEPTH,

	/**
	 * Predicated thresholding using a custom buffer.
	 */

	CUSTOM

}
