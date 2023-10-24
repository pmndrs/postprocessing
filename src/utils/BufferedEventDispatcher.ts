import { BaseEvent, EventDispatcher } from "three";

/**
 * A buffered event dispatcher.
 *
 * Calling {@link dispatchEvent} multiple times in quick succession will only dispatch a single event.
 *
 * @group Utils
 */

export class BufferedEventDispatcher<TEventMap extends object> extends EventDispatcher<TEventMap> {

	/**
	 * A timeout ID.
	 */

	private timeoutId: NodeJS.Timeout | number;

	/**
	 * Constructs a new buffered event dispatcher.
	 */

	constructor() {

		super();
		this.timeoutId = 0;

	}

	override dispatchEvent<T extends Extract<keyof TEventMap, string>>(event: BaseEvent<T> & TEventMap[T]): void {

		if(this.timeoutId !== 0) {

			clearTimeout(this.timeoutId);

		}

		this.timeoutId = setTimeout(() => {

			this.timeoutId = 0;
			super.dispatchEvent(event);

		});

	}

}
