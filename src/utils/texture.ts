import { Data3DTexture, Texture } from "three";

/**
 * Creates a hash string that identifies a given texture.
 *
 * @ignore
 * @param texture - A texture.
 * @return The hash value.
 * @group Utils
 */

export function getHash(texture: Texture): string {

	const texture3D = texture as Data3DTexture;

	const attributes = [
		texture.wrapS,
		texture.wrapT,
		texture3D.wrapR || 0,
		texture.magFilter,
		texture.minFilter,
		texture.anisotropy,
		texture.internalFormat,
		texture.format,
		texture.type,
		texture.generateMipmaps,
		texture.premultiplyAlpha,
		texture.flipY,
		texture.unpackAlignment,
		texture.colorSpace
	];

	return attributes.join(";");

}
