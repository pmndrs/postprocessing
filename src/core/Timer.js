const MILLISECONDS_TO_SECONDS = 1.0 / 1e3;
const SECONDS_TO_MILLISECONDS = 1e3;

/**
 * A timer.
 *
 * Original implementation by Michael Herzog (Mugen87).
 *
 * @todo Remove if Timer replaces Clock in three.js.
 * @see {@link https://github.com/mrdoob/three.js/pull/17912}
 *
 * @implements {EventListenerObject}
 * @implements {Disposable}
 */

export class Timer {

	/**
	 * Constructs a new timer.
	 */

	constructor() {

		/**
		 * The previous time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.previousTime = 0;

		/**
		 * The current time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.currentTime = 0;

		/**
		 * The most recent delta time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.delta = 0;

		/**
		 * The fixed time step in milliseconds.
		 *
		 * Default is 16.667 (60 fps).
		 *
		 * @type {Number}
		 * @private
		 */

		this.fixedDelta = 1000.0 / 60.0;

		/**
		 * The total elapsed time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.elapsed = 0;

		/**
		 * The timescale.
		 *
		 * @type {Number}
		 * @private
		 */

		this.timescale = 1.0;

		/**
		 * Determines whether this timer should use a fixed time step.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.fixedDeltaEnabled = false;

	}

	/**
	 * Enables or disables the fixed time step.
	 *
	 * @param {Boolean} enabled - Whether the fixed delta time should be used.
	 * @return {Timer} This timer.
	 */

	setFixedDeltaEnabled(enabled) {

		this.fixedDeltaEnabled = enabled;
		return this;

	}

	/**
	 * Enables or disables auto reset based on page visibility.
	 *
	 * If enabled, the timer will be reset when the page becomes visible. This
	 * effectively pauses the timer when the page is hidden. Has no effect if the
	 * API is not supported.
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API}
	 * @param {Boolean} enabled - Whether the timer should be reset on visibility change.
	 * @return {Timer} This timer.
	 */

	setAutoResetEnabled(enabled) {

		if(document !== undefined && document.hidden !== undefined) {

			if(enabled) {

				document.addEventListener("visibilitychange", this);

			} else {

				document.removeEventListener("visibilitychange", this);

			}

		}

		return this;

	}

	/**
	 * Returns the delta time.
	 *
	 * @return {Number} The delta time in seconds.
	 */

	getDelta() {

		return this.delta * MILLISECONDS_TO_SECONDS;

	}

	/**
	 * Returns the fixed delta time.
	 *
	 * @return {Number} The fixed delta time in seconds.
	 */

	getFixedDelta() {

		return this.fixedDelta * MILLISECONDS_TO_SECONDS;

	}

	/**
	 * Sets the fixed delta time.
	 *
	 * @param {Number} fixedDelta - The delta time in seconds.
	 * @return {Timer} This timer.
	 */

	setFixedDelta(fixedDelta) {

		this.fixedDelta = fixedDelta * SECONDS_TO_MILLISECONDS;
		return this;

	}

	/**
	 * Returns the elapsed time.
	 *
	 * @return {Number} The elapsed time in seconds.
	 */

	getElapsed() {

		return this.elapsed * MILLISECONDS_TO_SECONDS;

	}

	/**
	 * Returns the timescale.
	 *
	 * @return {Number} The timescale.
	 */

	getTimescale() {

		return this.timescale;

	}

	/**
	 * Sets the timescale.
	 *
	 * @param {Number} timescale - The timescale.
	 * @return {Timer} This timer.
	 */

	setTimescale(timescale) {

		this.timescale = timescale;
		return this;

	}

	/**
	 * Updates this timer.
	 *
	 * @param {Number} [timestamp] - The current time in milliseconds.
	 * @return {Timer} This timer.
	 */

	update(timestamp) {

		if(this.fixedDeltaEnabled) {

			this.delta = this.fixedDelta;

		} else {

			this.previousTime = this.currentTime;
			this.currentTime = (timestamp !== undefined) ?
				timestamp : performance.now();

			this.delta = this.currentTime - this.previousTime;

		}

		this.delta *= this.timescale;
		this.elapsed += this.deltaTime;

		return this;

	}

	/**
	 * Resets this timer.
	 *
	 * @return {Timer} This timer.
	 */

	reset() {

		this.delta = 0;
		this.elapsed = 0;
		this.currentTime = performance.now();

		return this;

	}

	/**
	 * Handles events.
	 *
	 * @param {Event} event - The event.
	 */

	handleEvent(event) {

		if(!document.hidden) {

			// Reset the current time.
			this.currentTime = performance.now();

		}

	}

	/**
	 * Disposes this timer.
	 */

	dispose() {

		document.removeEventListener("visibilitychange", this);

	}

}
