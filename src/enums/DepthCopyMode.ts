/**
 * An enumeration of depth copy modes.
 *
 * @group Enums
 */

export enum DepthCopyMode {

	/**
	 * Copies the full depth texture every frame.
	 */

	FULL,

	/**
	 * Copies a single texel from the depth texture on demand.
	 */

	SINGLE

}
