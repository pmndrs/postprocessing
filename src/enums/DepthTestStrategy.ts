/**
 * An enumeration of depth test strategies.
 *
 * @group Enums
 */

export enum DepthTestStrategy {

	/**
	 * Perform only a depth test.
	 */

	DEFAULT,

	/**
	 * Always keeps max depth values.
	 */

	KEEP_MAX_DEPTH,

	/**
	 * Always discards max depth values.
	 */

	DISCARD_MAX_DEPTH

}
