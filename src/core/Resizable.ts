/**
 * Describes objects that can be resized.
 *
 * @category Core
 */

export interface Resizable {

	/**
	 * Sets the size.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 */

	setSize(width: number, height: number): void;

}
