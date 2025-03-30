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

	add: SetEvent<T>;
	delete: SetEvent<T>;
	clear: BaseEvent;

}

/**
 * A set that emits events when its data changes.
 *
 * @param T - The type of the values.
 * @category Utils
 */

export class ObservableSet<T> extends EventDispatcher<ObservableSetEventMap<T>> implements Set<T> {

	// #region Events

	/**
	 * Triggers when an entry is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Triggers when a single entry is added through {@link add}.
	 *
	 * @event
	 */

	static readonly EVENT_ADD = "add";

	/**
	 * Triggers when a single entry is removed through {@link delete}.
	 *
	 * Does not trigger when {@link clear} is called.
	 *
	 * @event
	 */

	static readonly EVENT_DELETE = "delete";

	/**
	 * Triggers right before this set is cleared.
	 *
	 * @event
	 */

	static readonly EVENT_CLEAR = "clear";

	// #endregion

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

		this.dispatchEvent({ type: ObservableSet.EVENT_CLEAR });
		const result = this.data.clear();
		this.dispatchEvent({ type: ObservableSet.EVENT_CHANGE });
		return result;

	}

	delete(value: T): boolean {

		if(!this.data.has(value)) {

			return false;

		}

		this.dispatchEvent({ type: ObservableSet.EVENT_DELETE, value });
		this.data.delete(value);
		this.dispatchEvent({ type: ObservableSet.EVENT_CHANGE });
		return true;

	}

	has(value: T): boolean {

		return this.data.has(value);

	}

	add(value: T): this {

		this.data.add(value);
		this.dispatchEvent({ type: ObservableSet.EVENT_ADD, value });
		this.dispatchEvent({ type: ObservableSet.EVENT_CHANGE });
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
