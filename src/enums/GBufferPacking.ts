/**
 * An enumeration of available G-Buffer packing configurations.
 *
 * @category Enums
 * @internal
 */

export enum GBufferPacking {

	/**
	 * The normals and fragment velocities.
	 *
	 * - RG = Normals encoded using octahedron wrapping
	 * - BA = Velocity
	 */

	NORMAL_VELOCITY = "NormalVelocity"

}
