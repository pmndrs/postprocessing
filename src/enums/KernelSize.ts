/**
 * An enumeration of blur kernel sizes.
 *
 * @group Enums
 */

export enum KernelSize {

	/**
	 * A very small kernel that matches a 7x7 Gaussian blur kernel.
	 */

	VERY_SMALL = 0,

	/**
	 * A small kernel that matches a 25x25 Gaussian blur kernel.
	 */

	SMALL = 1,

	/**
	 * A medium sized kernel that matches a 63x63 Gaussian blur kernel.
	 */

	MEDIUM = 2,

	/**
	 * A large kernel that matches a 127x127 Gaussian blur kernel.
	 */

	LARGE = 3,

	/**
	 * A very large kernel that matches a 391x391 Gaussian blur kernel.
	 */

	VERY_LARGE = 4,

	/**
	 * A huge kernel that cannot be replicated with a single Gaussian blur pass.
	 */

	HUGE = 5

}
