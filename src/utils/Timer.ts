import { Disposable } from "../core/Disposable.js";
import { ImmutableTimer } from "./ImmutableTimer.js";

const MILLISECONDS_TO_SECONDS = 1.0 / 1e3;
const SECONDS_TO_MILLISECONDS = 1e3;

/**
 * A timer.
 *
 * Original implementation by Michael Herzog (Mugen87).
 *
 * @experimental Temporary substitute for {@link https://github.com/mrdoob/three.js/pull/17912}
 * @group Utils
 */

export class Timer implements EventListenerObject, Disposable, ImmutableTimer {

	/**
	 * The start time in milliseconds.
	 */

	private startTime: number;

	/**
	 * The previous time in milliseconds.
	 */

	private previousTime: number;

	/**
	 * The current time in milliseconds.
	 */

	private currentTime: number;

	/**
	 * The most recent delta time in milliseconds.
	 *
	 * @see {@link delta}
	 */

	private _delta: number;

	/**
	 * The total elapsed time in milliseconds.
	 *
	 * @see {@link elapsed}
	 */

	private _elapsed: number;

	/**
	 * The fixed time step in milliseconds. Default is 16.667 (60 fps).
	 *
	 * @see {@link fixedDelta}
	 */

	private _fixedDelta: number;

	/**
	 * @see {@link autoReset}
	 */

	private _autoReset: boolean;

	/**
	 * Determines whether this timer should use a fixed time step.
	 */

	useFixedDelta: boolean;

	/**
	 * The timescale.
	 */

	timescale: number;

	/**
	 * Constructs a new timer.
	 */

	constructor() {

		this.startTime = performance.now();
		this.previousTime = 0;
		this.currentTime = 0;

		this._delta = 0;
		this._elapsed = 0;
		this._fixedDelta = 1000.0 / 60.0;

		this.timescale = 1.0;
		this.useFixedDelta = false;
		this._autoReset = false;

	}

	/**
	 * Enables or disables auto reset based on page visibility.
	 *
	 * If enabled, the timer will be reset when the page becomes visible. This effectively pauses the timer when the page
	 * is hidden. Has no effect if the API is not supported.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	 */

	get autoReset(): boolean {

		return this._autoReset;

	}

	set autoReset(value: boolean) {

		if(typeof document !== "undefined" && document.hidden !== undefined) {

			if(value) {

				document.addEventListener("visibilitychange", this);

			} else {

				document.removeEventListener("visibilitychange", this);

			}

			this._autoReset = value;

		}

	}

	get delta(): number {

		return this._delta * MILLISECONDS_TO_SECONDS;

	}

	get fixedDelta(): number {

		return this._fixedDelta * MILLISECONDS_TO_SECONDS;

	}

	set fixedDelta(value: number) {

		this._fixedDelta = value * SECONDS_TO_MILLISECONDS;

	}

	get elapsed(): number {

		return this._elapsed * MILLISECONDS_TO_SECONDS;

	}

	/**
	 * Updates this timer.
	 *
	 * @param timestamp - The current time in milliseconds.
	 */

	update(timestamp?: number): void {

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

	reset(): void {

		this._delta = 0;
		this._elapsed = 0;
		this.currentTime = performance.now() - this.startTime;

	}

	handleEvent(e: Event): void {

		if(!document.hidden) {

			// Reset the current time.
			this.currentTime = performance.now() - this.startTime;

		}

	}

	dispose(): void {

		this.autoReset = false;

	}

}
