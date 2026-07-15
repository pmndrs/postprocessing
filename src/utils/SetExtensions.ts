/**
 * Describes additional Set features.
 *
 * @see https://github.com/tc39/proposal-collection-methods#proposal
 * @param T - The type of the values.
 * @category Utils
 */

export interface SetExtensions<T> {

	/**
	 * Removes multiple elements from the Set.
	 *
	 * @param values - The elements.
	 * @return This Set.
	 */

	deleteAll(...values: T[]): this;

	/**
	 * Adds multiple elements to the end of the Set.
	 *
	 * @param values - The elements.
	 * @return This Set.
	 */

	addAll(...values: T[]): this;

}
