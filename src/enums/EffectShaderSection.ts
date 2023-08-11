/**
 * An enumeration of effect shader placeholders.
 *
 * @group Enums
 */

export enum EffectShaderSection {

	/**
	 * A placeholder for function and variable declarations in the fragment shader.
	 */

	FRAGMENT_HEAD = "FRAGMENT_HEAD",

	/**
	 * A placeholder for UV transformations in the fragment shader.
	 */

	FRAGMENT_MAIN_UV = "FRAGMENT_MAIN_UV",

	/**
	 * A placeholder for color calculations in the fragment shader.
	 */

	FRAGMENT_MAIN_IMAGE = "FRAGMENT_MAIN_IMAGE",

	/**
	 * A placeholder for function and variable declarations in the vertex shader.
	 */

	VERTEX_HEAD = "VERTEX_HEAD",

	/**
	 * A placeholder for supporting calculations in the vertex shader.
	 */

	VERTEX_MAIN_SUPPORT = "VERTEX_MAIN_SUPPORT"

}
