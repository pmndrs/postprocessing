/**
 * Describes objects that can free internal resources.
 *
 * @group Core
 */

export interface Disposable {

	/**
	 * Frees internal resources.
	 */

	dispose(): void;

}
