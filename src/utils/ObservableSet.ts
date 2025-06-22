import { BaseEvent, EventDispatcher } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";

/**
 * An event that contains information about a value that was added or deleted.
 *
 * @param T - The type of the value.
 * @category Utils
 */

export interface SetEvent<T> extends BaseEvent {

	value: T;

}

/**
 * ObservableSet events.
 *
 * @param T - The type of the value.
 * @category Utils
 */

export interface ObservableSetEventMap<T> extends BaseEventMap {

	/**
	 * Triggers when a single entry is added.
	 *
	 * @event
	 */

	add: SetEvent<T>;

	/**
	 * Triggers when a single entry is removed.
	 *
	 * Does not trigger when the set is cleared.
	 *
	 * @event
	 */

	delete: SetEvent<T>;

	/**
	 * Triggers right before the set is cleared.
	 *
	 * @event
	 */

	clear: BaseEvent;

}

/**
 * A set that emits events when its data changes.
 *
 * @param T - The type of the values.
 * @category Utils
 */

export class ObservableSet<T> extends EventDispatcher<ObservableSetEventMap<T>> implements Set<T> {

	/**
	 * The internal data collection.
	 */

	private data: Set<T>;

	/**
	 * Constructs a new set.
	 *
	 * @param iterable - A list of values to add to this set.
	 */

	constructor(iterable?: Iterable<T>) {

		super();

		this.data = new Set<T>(iterable);

	}

	get size(): number {

		return this.data.size;

	}

	get [Symbol.toStringTag](): string {

		return this.data[Symbol.toStringTag];

	}

	[Symbol.iterator](): SetIterator<T> {

		return this.data[Symbol.iterator]();

	}

	clear(): void {

		if(this.data.size === 0) {

			return;

		}

		this.dispatchEvent({ type: "clear" });
		this.data.clear();
		this.dispatchEvent({ type: "change" });

	}

	delete(value: T): boolean {

		if(!this.data.has(value)) {

			return false;

		}

		this.dispatchEvent({ type: "delete", value });
		this.data.delete(value);
		this.dispatchEvent({ type: "change" });
		return true;

	}

	has(value: T): boolean {

		return this.data.has(value);

	}

	add(value: T): this {

		if(this.data.has(value)) {

			return this;

		}

		this.data.add(value);
		this.dispatchEvent({ type: "add", value });
		this.dispatchEvent({ type: "change" });
		return this;

	}

	entries(): SetIterator<[T, T]> {

		return this.data.entries();

	}

	keys(): SetIterator<T> {

		return this.data.keys();

	}

	values(): SetIterator<T> {

		return this.data.values();

	}

	forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: unknown): void {

		return this.data.forEach(callbackfn, thisArg);

	}

}
