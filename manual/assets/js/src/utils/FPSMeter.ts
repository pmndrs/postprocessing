/**
 * An FPS meter.
 */

export class FPSMeter {

	/**
	 * The current FPS as a string.
	 */

	fps: string;

	/**
	 * A timestamp in milliseconds.
	 */

	private timestamp: number;

	/**
	 * A time accumulator.
	 */

	private acc: number;

	/**
	 * A frame counter.
	 */

	private frames: number;

	/**
	 * Constructs a new FPS meter.
	 */

	constructor() {

		this.fps = "0";
		this.timestamp = 0;
		this.acc = 0;
		this.frames = 0;

	}

	/**
	 * Updates the FPS.
	 *
	 * @param timestamp - The current time in milliseconds.
	 */

	update(timestamp: number): void {

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
