/**
 * An enumeration of G-Buffer textures.
 *
 * The string values of the enum constants serve as texture IDs.
 *
 * @category Enums
 * @internal
 */

export enum GBufferTexture {

	/**
	 * The diffuse color of the scene.
	 */

	COLOR = "outputColor",

	/**
	 * The screen-space normals.
	 */

	NORMAL = "outputNormal",

	/**
	 * Roughness and metalness.
	 */

	ROUGHNESS_METALNESS = "outputRoughnessMetalness",

}
