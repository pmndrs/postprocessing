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

	/**
	 * Triggers when a single entry is added.
	 *
	 * @event
	 */

	add: MapEvent<K, V>;

	/**
	 * Triggers when a single entry is removed or overwritten.
	 *
	 * Does not trigger when the map is cleared.
	 *
	 * @event
	 */

	delete: MapEvent<K, V>;

	/**
	 * Triggers right before the maps is cleared.
	 *
	 * @event
	 */

	clear: BaseEvent;

}

/**
 * A map that emits events when its data changes.
 *
 * @param K - The type of the keys.
 * @param V - The type of the values.
 * @category Utils
 */

export class ObservableMap<K, V> extends EventDispatcher<ObservableMapEventMap<K, V>> implements Map<K, V> {

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

		this.dispatchEvent({ type: "clear" });
		const result = this.data.clear();
		this.dispatchEvent({ type: "change" });
		return result;

	}

	delete(key: K): boolean {

		if(!this.data.has(key)) {

			return false;

		}

		this.dispatchEvent({
			type: "delete",
			key: key,
			value: this.data.get(key) as V
		});

		this.data.delete(key);
		this.dispatchEvent({ type: "change" });
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
				type: "delete",
				key: key,
				value: this.data.get(key) as V
			});

		}

		this.data.set(key, value);
		this.dispatchEvent({ type: "add", key, value });
		this.dispatchEvent({ type: "change" });
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
