/**
 * A timer that provides read access to time data.
 *
 * @category Utils
 */

export interface ImmutableTimer {

	/**
	 * Returns the current delta time in seconds.
	 *
	 * @return The current delta time.
	 */

	getDelta(): number;

	/**
	 * Returns the elapsed time in seconds.
	 *
	 * @return The elapsed time.
	 */

	getElapsed(): number;

}
