import { EventDispatcher } from "three";

/**
 * A map that emits events of type {@link EVENT_CHANGE} when its data changes.
 *
 * @group Utils
 */

export class ObservableMap<K, V> extends EventDispatcher implements Map<K, V> {

	/**
	 * Triggers when an entry is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE: string = "change";

	/**
	 * The internal data collection.
	 */

	private data: Map<K, V>;

	/**
	 * Constructs a new map.
	 *
	 * @param iterable - A list of entries to add to this map.
	 */

	constructor(iterable?: Iterable<readonly [K, V]>) {

		super();
		this.data = new Map<K, V>(iterable);

	}

	get size(): number {

		return this.data.size;

	}

	get [Symbol.toStringTag](): string {

		return this.data[Symbol.toStringTag];

	}

	clear(): void {

		const result = this.data.clear();
		this.dispatchEvent({ type: ObservableMap.EVENT_CHANGE });
		return result;

	}

	delete(key: K): boolean {

		const result = this.data.delete(key);
		this.dispatchEvent({ type: ObservableMap.EVENT_CHANGE });
		return result;

	}

	get(key: K): V | undefined {

		return this.data.get(key);

	}

	has(key: K): boolean {

		return this.data.has(key);

	}

	set(key: K, value: V): this {

		this.data.set(key, value);
		this.dispatchEvent({ type: ObservableMap.EVENT_CHANGE });
		return this;

	}

	entries(): IterableIterator<[K, V]> {

		return this.data.entries();

	}

	keys(): IterableIterator<K> {

		return this.data.keys();

	}

	values(): IterableIterator<V> {

		return this.data.values();

	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {

		return this.data.forEach(callbackfn, thisArg);

	}

	[Symbol.iterator](): IterableIterator<[K, V]> {

		return this.data[Symbol.iterator]();

	}

}
