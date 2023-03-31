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

	get delta() { return NaN; }

	/**
	 * The fixed delta time in seconds.
	 *
	 * @type {Number}
	 */

	get fixedDelta() { return NaN; }

	/**
	 * The elapsed time in seconds.
	 *
	 * @type {Number}
	 */

	get elapsed() { return NaN; }

}
