import { MagnificationTextureFilter, MinificationTextureFilter, PixelFormat, TextureDataType } from "three";

/**
 * A G-Buffer texture configuration.
 *
 * @category Utils
 * @internal
 */

export interface GBufferTextureConfig {

	magFilter: MagnificationTextureFilter;
	minFilter: MinificationTextureFilter;
	format: PixelFormat;
	type: TextureDataType;
	isColorBuffer: boolean;

}
