/**
 * An FPS meter.
 */

export class FPSMeter {

	/**
	 * Constructs a new FPS meter.
	 */

	constructor() {

		/**
		 * The current FPS.
		 *
		 * @type {String}
		 */

		this.fps = "0";

		/**
		 * A timestamp in milliseconds.
		 *
		 * @type {Number}
		 * @private
		 */

		this.timestamp = 0;

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.acc = 0;

		/**
		 * A frame counter.
		 *
		 * @type {Number}
		 * @private
		 */

		this.frames = 0;

	}

	/**
	 * Updates the FPS.
	 *
	 * @param {Number} timestamp - The current time in milliseconds.
	 */

	update(timestamp) {

		++this.frames;

		this.acc += timestamp - this.timestamp;
		this.timestamp = timestamp;

		if(this.acc >= 1e3) {

			this.fps = this.frames.toFixed(0);
			this.acc = 0.0;
			this.frames = 0;

		}

	}

}
