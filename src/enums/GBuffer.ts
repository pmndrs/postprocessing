/**
 * An enumeration of G-Buffer components.
 *
 * @category Enums
 */

export enum GBuffer {

	/**
	 * The color of the scene. Takes up one buffer, either 8 or 16 bit RGBA.
	 */

	COLOR = "Color",

	/**
	 * The scene depth is stored in a 24 or 32 bit depth texture.
	 */

	DEPTH = "Depth",

	/**
	 * The view-space normals are stored in a 16-bit RGB buffer.
	 */

	NORMAL = "Normal",

	/**
	 * An 8 bit OcclusionRoughnessMetalness RGB buffer.
	 *
	 * - R = Ambient Occlusion
	 * - G = Roughness
	 * - B = Metalness
	 */

	ORM = "ORM",

	/**
	 * The total emissive radiance. Takes up one buffer, either 8 or 16 bit RGBA.
	 */

	EMISSION = "Emission"

}
