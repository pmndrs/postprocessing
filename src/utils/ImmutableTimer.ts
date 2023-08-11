/**
 * A timer that provides read access to time data.
 *
 * @group Utils
 */

export interface ImmutableTimer {

	/**
	 * The current delta time in seconds.
	 */

	get delta(): number;

	/**
	 * The fixed delta time in seconds.
	 */

	get fixedDelta(): number;

	/**
	 * The elapsed time in seconds.
	 */

	get elapsed(): number;

}
