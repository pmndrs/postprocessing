/**
 * An enumeration of WebGL 1 extensions.
 *
 * @group Enums
 */

export enum WebGLExtension {

	/**
	 * Enables derivatives by adding the functions dFdx, dFdy and fwidth.
	 */

	DERIVATIVES = "derivatives",

	/**
	 * Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.
	 */

	FRAG_DEPTH = "fragDepth",

	/**
	 * Enables multiple render targets (MRT) support.
	 */

	DRAW_BUFFERS = "drawBuffers",

	/**
	 * Enables explicit control of texture LOD.
	 */

	SHADER_TEXTURE_LOD = "shaderTextureLOD"

}
