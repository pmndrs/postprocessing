/**
 * Converts an array into a record object.
 *
 * @param a - A target record.
 * @param b - The number.
 * @return The record.
 */

export function toRecord<T extends number | string | symbol>(array: T[]): Record<T, T> {

	return array.reduce((a: Record<T, T>, b: T) => {

		a[b] = b;
		return a;

	}, {} as Record<T, T>);

}
