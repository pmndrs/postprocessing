/**
 * Describes additional Map features.
 *
 * @see https://github.com/tc39/proposal-collection-methods#proposal
 * @param K - The type of the key.
 * @param V - The type of the value.
 * @category Utils
 */

export interface MapExtensions<K, V> {

	/**
	 * Removes multiple entries from the Map.
	 *
	 * @param keys - The keys of the entries that should be deleted.
	 * @return This Map.
	 */

	deleteAll(...values: K[]): this;

	/**
	 * Sets multiple entries.
	 *
	 * @param entries - The entries.
	 * @return This Map.
	 */

	setAll(...entries: [K, V][]): this;

}
