import { TextureParameters } from "three";

/**
 * A texture template.
 *
 * @category Textures
 */

export interface TextureParametersWithName extends TextureParameters {

	/**
	 * The name of the texture.
	 */

	name?: string;

}
