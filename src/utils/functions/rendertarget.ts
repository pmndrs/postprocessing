import { RenderTarget, TextureParameters } from "three";

/**
 * Compares texture parameters.
 *
 * @param a - Texture parameters.
 * @param b - Texture parameters.
 * @return Whether the parameters are equal.
 * @category Utils
 * @internal
 */

export function textureParametersEqual(a: TextureParameters, b: TextureParameters): boolean {

	for(const key of Object.keys(a) as (keyof TextureParameters)[]) {

		if(a[key] !== b[key]) {

			return false;

		}

	}

	return true;

}

/**
 * @param a - A render target.
 * @param b - A render target.
 */

function targetOptionsEqual(a: RenderTarget, b: RenderTarget): boolean {

	for(const key of Object.keys(a) as (keyof RenderTarget)[]) {

		if(a[key] !== b[key]) {

			return false;

		}

	}

	return true;

}

/**
 * @param a - A render target.
 * @param b - A render target.
 */

function texturesEqual(a: RenderTarget, b: RenderTarget): boolean {

	if(a.textures.length !== b.textures.length) {

		return false;

	}

	for(let i = 0, l = a.textures.length; i < l; ++i) {

		if(!textureParametersEqual(a.textures[i] as TextureParameters, b.textures[i] as TextureParameters)) {

			return false;

		}

	}

	return true;

}

/**
 * Compares depth textures.
 *
 *
 * @param a - A render target.
 * @param b - A render target.
 * @return True if both depth textures are equal.
 */

function depthTextureEqual(a: RenderTarget, b: RenderTarget): boolean {

	const depthA = a.depthTexture ?? null;
	const depthB = b.depthTexture ?? null;

	if(depthA === depthB) {

		return true;

	}

	if(depthA === null || depthB === null) {

		return false;

	}

	return textureParametersEqual(depthA as TextureParameters, depthB as TextureParameters);

}

/**
 * Compares two render targets.
 *
 * @param a - A render target.
 * @param b - Another render target.
 * @return True if the render targets are equal.
 */

export function equals(a: RenderTarget, b: RenderTarget): boolean {

	return (a === b) || (
		textureParametersEqual(a as TextureParameters, b as TextureParameters) &&
		targetOptionsEqual(a, b) &&
		texturesEqual(a, b) &&
		depthTextureEqual(a, b)
	);

}
