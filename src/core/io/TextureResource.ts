import { Texture } from "three";
import { Resource } from "./Resource.js";

/**
 * A texture resource wrapper.
 *
 * @category IO
 */

export class TextureResource extends Resource<Texture | null> {

	/**
	 * Constructs a new texture resource.
	 *
	 * @param value - A texture.
	 */

	constructor(value: Texture | null = null) {

		super(value);

	}

}
