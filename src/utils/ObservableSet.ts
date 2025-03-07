import { EventDispatcher } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";

/**
 * A set that emits events of type {@link EVENT_CHANGE} when its data changes.
 *
 * @param T - The type of the items.
 * @category Utils
 */

export class ObservableSet<T> extends EventDispatcher<BaseEventMap> implements Set<T> {

	/**
	 * Triggers when an entry is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * The internal data collection.
	 */

	private data: Set<T>;

	/**
	 * Constructs a new set.
	 *
	 * @param iterable - A list of entries to add to this set.
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

		const result = this.data.clear();
		this.dispatchEvent({ type: ObservableSet.EVENT_CHANGE });
		return result;

	}

	delete(value: T): boolean {

		const result = this.data.delete(value);
		this.dispatchEvent({ type: ObservableSet.EVENT_CHANGE });
		return result;

	}

	has(value: T): boolean {

		return this.data.has(value);

	}

	add(value: T): this {

		this.data.add(value);
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
