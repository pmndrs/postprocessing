/**
 * A read-only map that emits events when its entries change.
 *
 * This interface describes maps that can be connected as live data sources.
 * Consumers may read entries, but cannot mutate the map through this interface.
 *
 * @param K - The type of the keys.
 * @param V - The type of the values.
 * @category Utils
 */

export interface ObservableReadonlyMap<K, V> extends ReadonlyMap<K, V> {

	/**
	 * Adds an event listener.
	 *
	 * @param type - The event type.
	 * @param listener - A listener that will be called when the map changes.
	 */

	addEventListener(type: "change", listener: () => void): void;

	/**
	 * Removes an event listener.
	 *
	 * @param type - The event type.
	 * @param listener - The listener to remove.
	 */

	removeEventListener(type: "change", listener: () => void): void;

}
