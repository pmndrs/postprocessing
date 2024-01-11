/**
 * An enumeration of effect shader placeholders.
 *
 * @category Enums
 */

export enum EffectShaderSection {

	/**
	 * A placeholder for function and variable declarations in the fragment shader.
	 */

	FRAGMENT_HEAD_EFFECTS = "$FRAGMENT_HEAD_EFFECTS",

	/**
	 * A placeholder for GBuffer declarations in the fragment shader.
	 */

	FRAGMENT_HEAD_GBUFFER = "$FRAGMENT_HEAD_GBUFFER",

	/**
	 * A placeholder for GData declarations in the fragment shader.
	 */

	FRAGMENT_HEAD_GDATA = "$FRAGMENT_HEAD_GDATA",

	/**
	 * A placeholder for UV transformations in the fragment shader.
	 */

	FRAGMENT_MAIN_UV = "$FRAGMENT_MAIN_UV",

	/**
	 * A placeholder for GData preparations in the fragment shader.
	 */

	FRAGMENT_MAIN_GDATA = "$FRAGMENT_MAIN_GDATA",

	/**
	 * A placeholder for color calculations in the fragment shader.
	 */

	FRAGMENT_MAIN_IMAGE = "$FRAGMENT_MAIN_IMAGE",

	/**
	 * A placeholder for function and variable declarations in the vertex shader.
	 */

	VERTEX_HEAD = "$VERTEX_HEAD",

	/**
	 * A placeholder for supporting calculations in the vertex shader.
	 */

	VERTEX_MAIN_SUPPORT = "$VERTEX_MAIN_SUPPORT"

}
