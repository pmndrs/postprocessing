/**
 * An enumeration of virtual G-Buffer components for debugging purposes.
 *
 * This enum is intended to be used with `BufferDebugPass` only.
 *
 * @category Enums
 */

export enum GBufferDebug {

	/**
	 * Reconstructs the world position from the depth buffer.
	 */

	POSITION = "Position",

	/**
	 * Calculates the distance from the fragment to the camera.
	 */

	DISTANCE = "Distance"

}
