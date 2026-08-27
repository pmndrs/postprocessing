import { ObservableMap } from "./ObservableMap.js";
import { ObservableReadonlyMap } from "./ObservableReadonlyMap.js";

/**
 * A composite map.
 *
 * @param K - The type of the key.
 * @param V - The type of the value.
 * @category Utils
 */

export class CompositeMap<K, V> extends ObservableMap<K, V> {

	/**
	 * A list of connected maps.
	 */

	private readonly connectedMaps: ObservableReadonlyMap<K, V>[];

	/**
	 * @see {@link compositeData}
	 */

	private readonly _compositeData: Map<K, V>;

	/**
	 * Indicates whether the cached entries need to be updated.
	 */

	private needsUpdate: boolean;

	/**
	 * An event listener that dispatches a `change` event.
	 */

	private readonly propagateChangeEvent: () => void;

	/**
	 * Constructs a new composite map.
	 *
	 * @param iterable - A list of entries to add to this map.
	 */

	constructor(iterable?: Iterable<readonly [K, V]>) {

		super(iterable);

		this.propagateChangeEvent = () => {

			this.needsUpdate = true;
			this.dispatchEvent({ type: "change" });

		};

		this.connectedMaps = [];
		this._compositeData = new Map<K, V>();
		this.needsUpdate = true;

	}

	override get size(): number {

		return this.compositeData.size;

	}

	/**
	 * The combined data from this map and the connected maps.
	 */

	get compositeData(): Map<K, V> {

		if(this.needsUpdate) {

			this.updateCompositeData();

		}

		return this._compositeData;

	}

	/**
	 * Connects another map to this one.
	 *
	 * Entries from the connected map are included in this map's composite data.
	 * Local entries in this map are overridden by connected entries with the same key.
	 *
	 * @param other - The map to read entries from.
	 * @throws If the given map is this map.
	 */

	connect(other: ObservableReadonlyMap<K, V>): void {

		if(other === this) {

			throw new Error("Cannot connect map to itself");

		}

		if(!this.connectedMaps.includes(other)) {

			other.addEventListener("change", this.propagateChangeEvent);

			this.needsUpdate = true;
			this.connectedMaps.push(other);
			this.dispatchEvent({ type: "change" });

		}

	}

	/**
	 * Disconnects a given map from this one.
	 *
	 * If no specific map is given, all connected maps will be disconnected.
	 *
	 * @param other - The map to disconnect. Omit to disconnect all connected maps.
	 */

	disconnect(other?: ObservableReadonlyMap<K, V>): void {

		if(other !== undefined) {

			const index = this.connectedMaps.indexOf(other);

			if(index >= 0) {

				other.removeEventListener("change", this.propagateChangeEvent);

				this.connectedMaps.splice(index, 1);
				this.needsUpdate = true;
				this.dispatchEvent({ type: "change" });

			}

			return;

		}

		if(this.connectedMaps.length === 0) {

			return;

		}

		for(const map of this.connectedMaps) {

			map.removeEventListener("change", this.propagateChangeEvent);

		}

		this.connectedMaps.length = 0;
		this.needsUpdate = true;
		this.dispatchEvent({ type: "change" });

	}

	override set(key: K, value: V): this {

		this.needsUpdate = true;
		return super.set(key, value);

	}

	override setAll(...entries: [K, V][]): this {

		if(entries.length > 0) {

			this.needsUpdate = true;

		}

		return super.setAll(...entries);

	}

	override delete(key: K): boolean {

		if(super.has(key)) {

			this.needsUpdate = true;

		}

		return super.delete(key);

	}

	override deleteAll(...keys: K[]): this {

		for(const key of keys) {

			if(super.has(key)) {

				this.needsUpdate = true;
				break;

			}

		}

		return super.deleteAll(...keys);

	}

	/**
	 * Removes all local elements from the Map.
	 *
	 * This method does not disconnect maps that are currently connected to this map.
	 *
	 * @see {@link disconnect} for disconnecting all maps.
	 */

	override clear(): void {

		if(super.size > 0) {

			this.needsUpdate = true;

		}

		super.clear();

	}

	override get(key: K): V | undefined {

		return this.compositeData.get(key);

	}

	override has(key: K): boolean {

		return this.compositeData.has(key);

	}

	/**
	 * Updates the composite data.
	 */

	private updateCompositeData(): void {

		const compositeData = this._compositeData;
		compositeData.clear();

		// Local data first.
		for(const [key, value] of super.entries()) {

			compositeData.set(key, value);

		}

		// Connected data overrides local data.
		for(const m of this.connectedMaps) {

			for(const [key, value] of m.entries()) {

				compositeData.set(key, value);

			}

		}

		this.needsUpdate = false;

	}

	override entries(): MapIterator<[K, V]> {

		return this.compositeData.entries();

	}

	override keys(): MapIterator<K> {

		return this.compositeData.keys();

	}

	override values(): MapIterator<V> {

		return this.compositeData.values();

	}

	override forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: unknown): void {

		this.compositeData.forEach(callbackfn, thisArg);

	}

	/**
	 * Returns the local entries, excluding connected maps.
	 */

	localEntries(): MapIterator<[K, V]> {

		return super.entries();

	}

	/**
	 * Returns the local keys, excluding connected maps.
	 */

	localKeys(): MapIterator<K> {

		return super.keys();

	}

	/**
	 * Returns the local values, excluding connected maps.
	 */

	localValues(): MapIterator<V> {

		return super.values();

	}

	override [Symbol.iterator](): MapIterator<[K, V]> {

		return this.entries();

	}

}
