import { BaseEvent, EventDispatcher } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";

/**
 * An event that contains information about a map entry that was added or deleted.
 *
 * @param K - The type of the key.
 * @param V - The type of the value.
 * @category Utils
 */

export interface MapEvent<K, V> extends BaseEvent {

	key: K;
	value: V;

}

/**
 * ObservableMap events.
 *
 * @param K - The type of the key.
 * @param V - The type of the value.
 * @category Utils
 */

export interface ObservableMapEventMap<K, V> extends BaseEventMap {

	add: MapEvent<K, V>;
	delete: MapEvent<K, V>;

}

/**
 * A map that emits events of type {@link EVENT_CHANGE} when its data changes.
 *
 * @param K - The type of the keys.
 * @param V - The type of the values.
 * @category Utils
 */

export class ObservableMap<K, V> extends EventDispatcher<ObservableMapEventMap<K, V>> implements Map<K, V> {

	/**
	 * Triggers when an entry is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Triggers when a single entry is added through {@link set}.
	 *
	 * @event
	 */

	static readonly EVENT_ADD = "add";

	/**
	 * Triggers when a single entry is removed or overwritten, either through {@link delete} or {@link set}.
	 *
	 * Does not trigger when {@link clear} is called.
	 *
	 * @event
	 */

	static readonly EVENT_DELETE = "delete";

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

		if(!this.data.has(key)) {

			return false;

		}

		this.dispatchEvent({
			type: ObservableMap.EVENT_DELETE,
			key: key,
			value: this.data.get(key) as V
		});

		this.data.delete(key);
		this.dispatchEvent({ type: ObservableMap.EVENT_CHANGE });
		return true;

	}

	get(key: K): V | undefined {

		return this.data.get(key);

	}

	has(key: K): boolean {

		return this.data.has(key);

	}

	set(key: K, value: V): this {

		if(this.data.has(key)) {

			this.dispatchEvent({
				type: ObservableMap.EVENT_DELETE,
				key: key,
				value: this.data.get(key) as V
			});

		}

		this.data.set(key, value);
		this.dispatchEvent({ type: ObservableMap.EVENT_ADD, key, value });
		this.dispatchEvent({ type: ObservableMap.EVENT_CHANGE });
		return this;

	}

	entries(): MapIterator<[K, V]> {

		return this.data.entries();

	}

	keys(): MapIterator<K> {

		return this.data.keys();

	}

	values(): MapIterator<V> {

		return this.data.values();

	}

	forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {

		return this.data.forEach(callbackfn, thisArg);

	}

	[Symbol.iterator](): MapIterator<[K, V]> {

		return this.data[Symbol.iterator]();

	}

}
