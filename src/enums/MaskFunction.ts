/**
 * An enumeration of mask functions.
 *
 * @group Enums
 */

export enum MaskFunction {

	/**
	 * Discards elements when the respective mask value is zero.
	 */

	DISCARD = 0,

	/**
	 * Multiplies the input buffer with the mask texture.
	 */

	MULTIPLY = 1

}
