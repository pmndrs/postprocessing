/**
 * A timer that provides read access to time data.
 *
 * @category Utils
 */

export interface ImmutableTimer {

	/**
	 * Returns the current delta time in seconds.
	 */

	getDelta(): number;

	/**
	 * Returns the elapsed time in seconds.
	 */

	getElapsed(): number;

}
