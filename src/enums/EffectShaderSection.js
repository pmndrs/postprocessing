
/**
 * An enumeration of effect shader placeholders.
 *
 * @type {Object}
 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations in the fragment shader.
 * @property {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations in the fragment shader.
 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations in the fragment shader.
 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations in the vertex shader.
 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations in the vertex shader.
 */

export const EffectShaderSection = {
	FRAGMENT_HEAD: "FRAGMENT_HEAD",
	FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
	FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
	VERTEX_HEAD: "VERTEX_HEAD",
	VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"
};
