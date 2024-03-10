const MILLISECONDS_TO_SECONDS = 1.0 / 1e3;
const SECONDS_TO_MILLISECONDS = 1e3;

/**
 * A timer.
 *
 * Original implementation by Michael Herzog (Mugen87).
 *
 * @deprecated Use `three/addons/misc/Timer.js` instead.
 * @implements {ImmutableTimer}
 * @implements {EventListenerObject}
 * @implements {Disposable}
 */

export class Timer {

	/**
	 * Constructs a new timer.
	 */

	constructor() {

		/**
		 * The start time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.startTime = performance.now();

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
		 * @see {@link delta}
		 */

		this._delta = 0;

		/**
		 * The total elapsed time in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 * @see {@link elapsed}
		 */

		this._elapsed = 0;

		/**
		 * The fixed time step in milliseconds. Default is 16.667 (60 fps).
		 *
		 * @type {Number}
		 * @private
		 * @see {@link fixedDelta}
		 */

		this._fixedDelta = 1000.0 / 60.0;

		/**
		 * The timescale.
		 *
		 * @type {Number}
		 */

		this.timescale = 1.0;

		/**
		 * Determines whether this timer should use a fixed time step.
		 *
		 * @type {Boolean}
		 */

		this.useFixedDelta = false;

		/**
		 * @type {Boolean}
		 * @private
		 * @see {@link autoReset}
		 */

		this._autoReset = false;

	}

	/**
	 * Enables or disables auto reset based on page visibility.
	 *
	 * If enabled, the timer will be reset when the page becomes visible. This effectively pauses the timer when the page
	 * is hidden. Has no effect if the API is not supported.
	 *
	 * @type {Boolean}
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	 */

	get autoReset() {

		return this._autoReset;

	}

	set autoReset(value) {

		if(typeof document !== "undefined" && document.hidden !== undefined) {

			if(value) {

				document.addEventListener("visibilitychange", this);

			} else {

				document.removeEventListener("visibilitychange", this);

			}

			this._autoReset = value;

		}

	}

	get delta() {

		return this._delta * MILLISECONDS_TO_SECONDS;

	}

	get fixedDelta() {

		return this._fixedDelta * MILLISECONDS_TO_SECONDS;

	}

	set fixedDelta(value) {

		this._fixedDelta = value * SECONDS_TO_MILLISECONDS;

	}

	get elapsed() {

		return this._elapsed * MILLISECONDS_TO_SECONDS;

	}

	/**
	 * Updates this timer.
	 *
	 * @param {Boolean} [timestamp] - The current time in milliseconds.
	 */

	update(timestamp) {

		if(this.useFixedDelta) {

			this._delta = this.fixedDelta;

		} else {

			this.previousTime = this.currentTime;
			this.currentTime = ((timestamp !== undefined) ? timestamp : performance.now()) - this.startTime;
			this._delta = this.currentTime - this.previousTime;

		}

		this._delta *= this.timescale;
		this._elapsed += this._delta;

	}

	/**
	 * Resets this timer.
	 */

	reset() {

		this._delta = 0;
		this._elapsed = 0;
		this.currentTime = performance.now() - this.startTime;

	}

	getDelta() {

		return this.delta;

	}

	getElapsed() {

		return this.elapsed;

	}

	handleEvent(e) {

		if(!document.hidden) {

			// Reset the current time.
			this.currentTime = performance.now() - this.startTime;

		}

	}

	dispose() {

		this.autoReset = false;

	}

}
