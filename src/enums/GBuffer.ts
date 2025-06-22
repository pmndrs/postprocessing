/**
 * An enumeration of G-Buffer components.
 *
 * @category Enums
 */

export enum GBuffer {

	/**
	 * The color of the scene.
	 */

	COLOR = "Color",

	/**
	 * The scene depth.
	 */

	DEPTH = "Depth",

	/**
	 * The view-space normals.
	 */

	NORMAL = "Normal",

	/**
	 * An Occlusion-Roughness-Metalness buffer.
	 *
	 * - R = Ambient Occlusion
	 * - G = Roughness
	 * - B = Metalness
	 */

	ORM = "ORM",

	/**
	 * The total emissive radiance.
	 */

	EMISSION = "Emission"

}
