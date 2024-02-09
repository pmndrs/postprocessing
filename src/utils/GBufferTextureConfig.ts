import { MagnificationTextureFilter, MinificationTextureFilter, PixelFormat, TextureDataType } from "three";

/**
 * A G-Buffer texture configuration.
 *
 * @category Utils
 */

export interface GBufferTextureConfig {

	/**
	 * The texture magnification filter.
	 */

	magFilter: MagnificationTextureFilter;

	/**
	 * The texture minification filter.
	 */

	minFilter: MinificationTextureFilter;

	/**
	 * The pixel format.
	 */

	format: PixelFormat;

	/**
	 * The texture data type.
	 */

	type: TextureDataType;

	/**
	 * Indicates whether the texture stores color values.
	 */

	isColorBuffer: boolean;

}
