/**
 * An enumeration of G-Buffer components.
 *
 * @category Enums
 */

export enum GBuffer {

	/**
	 * The color of the scene. Uses an 8 or 16 bit RGBA buffer.
	 */

	COLOR = "Color",

	/**
	 * The scene depth is stored in a 24 or 32 bit depth texture.
	 */

	DEPTH = "Depth",

	/**
	 * The view-space normals are stored in a 16 bit RGBA buffer.
	 */

	NORMAL = "Normal",

	/**
	 * An 8 bit OcclusionRoughnessMetalness buffer.
	 *
	 * - R = Ambient Occlusion
	 * - G = Roughness
	 * - B = Metalness
	 */

	ORM = "ORM",

	/**
	 * The total emissive radiance. Uses an 8 or 16 bit RGBA buffer.
	 */

	EMISSION = "Emission"

}
