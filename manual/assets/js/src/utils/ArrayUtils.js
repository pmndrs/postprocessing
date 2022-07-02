/**
 * Converts an array into a record object.
 *
 * @param {Record<Number|String, Number|String>} a - The record.
 * @param {Number|String} b - The number.
 * @return {Record<Number|String, Number|String>} The record.
 */

export function toRecord(a, b) {

	a[b] = b;
	return a;

}
