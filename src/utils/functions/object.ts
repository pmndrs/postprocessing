
/**
 * Shallowly compares two objects.
 *
 * @param a - An object.
 * @param b - Another object.
 * @return Whether the objects are shallowly equal.
 * @category Utils
 * @internal
 */

export function shallowObjectEquals(a: object, b: object): boolean {

	for(const key of Object.keys(a) as (keyof object)[]) {

		if(a[key] !== b[key]) {

			return false;

		}

	}

	return true;

}
