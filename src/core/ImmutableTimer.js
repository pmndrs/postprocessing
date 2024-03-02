/**
 * A timer that provides read access to time data.
 *
 * @interface
 */

export class ImmutableTimer {

	/**
	 * The current delta time in seconds.
	 *
	 * @type {Number}
	 */

	getDelta() { return NaN; }

	/**
	 * The elapsed time in seconds.
	 *
	 * @type {Number}
	 */

	getElapsed() { return NaN; }

}
