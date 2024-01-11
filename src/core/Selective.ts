import { Selection } from "../utils/Selection.js";

/**
 * Describes objects that can operate on a selection of objects.
 *
 * @category Core
 */

export interface Selective {

	/**
	 * An object selection.
	 */

	readonly selection: Selection;

}
