import {
	LinearEncoding,
	REVISION,
	RGBAFormat,
	sRGBEncoding,
	UnsignedByteType
} from "three";

/**
 * Determines the texture inline decoding.
 *
 * @param {Texture} texture - A texture.
 * @param {Boolean} isWebGL2 - Whether the context is WebGL 2.
 * @return {String} The decoding.
 * @ignore
 */

export function getTextureDecoding(texture, isWebGL2) {

	let decoding = "texel";

	if(texture !== null) {

		// Usage of SRGB8_ALPHA8 was introduced in three r133 and disabled temporarily in r135.
		const revision = Number.parseInt(REVISION);

		// Disable inline decoding for sRGB textures in WebGL 2.
		const sRGB8Alpha8 = (
			isWebGL2 &&
			revision >= 133 && revision !== 135 &&
			texture.format === RGBAFormat &&
			texture.type === UnsignedByteType &&
			texture.encoding === sRGBEncoding
		);

		if(!sRGB8Alpha8) {

			switch(texture.encoding) {

				case sRGBEncoding:
					decoding = "sRGBToLinear(texel)";
					break;

				case LinearEncoding:
					decoding = "texel";
					break;

				default:
					throw new Error(`Unsupported encoding: ${texture.encoding}`);

			}

		}

	}

	return decoding;

}
