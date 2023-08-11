/**
 * Linearly interpolates between two values.
 *
 * @ignore
 * @param a - The initial value.
 * @param b - The target value.
 * @param p - The interpolation value.
 * @return The interpolated value.
 * @group Utils
 */

export function lerp(a: number, b: number, p: number): number {

	return a + (b - a) * p;

}

/**
 * Clamps a value to the range [0, 1].
 *
 * @ignore
 * @param a - The value.
 * @return The saturated value.
 * @group Utils
 */

export function saturate(a: number): number {

	return Math.min(Math.max(a, 0.0), 1.0);

}
