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
