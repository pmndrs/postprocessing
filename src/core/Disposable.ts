/**
 * Describes objects that can free internal resources.
 *
 * @category Core
 */

export interface Disposable {

	/**
	 * Frees internal resources.
	 */

	dispose(): void;

}

/**
 * Checks if a given object can be disposed.
 *
 * @param object - The object.
 * @return Whether the object is of type Disposable.
 */

export function isDisposable(object?: object): object is Disposable {

	return object !== null && typeof object === "object" &&
		"dispose" in object && typeof object.dispose === "function";

}
