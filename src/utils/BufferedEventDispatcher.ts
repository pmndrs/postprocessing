import { Event, EventDispatcher } from "three";

/**
 * A buffered event dispatcher.
 *
 * Calling {@link dispatchEvent} multiple times in quick succession will only dispatch a single event.
 *
 * @group Utils
 */

export class BufferedEventDispatcher extends EventDispatcher {

	/**
	 * A timeout ID.
	 */

	private timeoutId: NodeJS.Timeout | number;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();
		this.timeoutId = 0;

	}

	override dispatchEvent(event: Event): void {

		if(this.timeoutId !== 0) {

			clearTimeout(this.timeoutId);

		}

		this.timeoutId = setTimeout(() => {

			this.timeoutId = 0;
			super.dispatchEvent(event);

		});

	}

}
