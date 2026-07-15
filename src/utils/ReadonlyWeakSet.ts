/**
 * A WeakSet that only exposes read access.
 *
 * @param T - The type of the values.
 * @category Utils
 */

export interface ReadonlyWeakSet<T extends WeakKey> {

	/**
	 * Checks whether the given value is part of this set.
	 *
	 * @param value - The value to check.
	 * @return Whether the value exists in this set.
	 */

	has(value: T): boolean;

	readonly [Symbol.toStringTag]: string;

}
