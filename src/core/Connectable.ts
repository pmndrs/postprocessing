/**
 * Describes objects that can be connected.
 *
 * @category Core
 */

export interface Connectable {

	/**
	 * Connects the given object to this one.
	 *
	 * @param other - The object to connect.
	 */

	connect(other: unknown): this;

	/**
	 * Disconnects the given object from this one.
	 *
	 * @param other - The object to disconnect.
	 */

	disconnect(other: unknown): this;

}
