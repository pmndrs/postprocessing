/**
 * Supported image formats.
 */

declare type ImageFormat = ".png" | ".jpg";

/**
 * Returns a list of skybox image URLs to load.
 *
 * @param name - The name of the cube map.
 * @param format - The image format.
 * @return The URLs.
 */

export function getSkyboxUrls(name: string, format: ImageFormat = ".png"): string[] {

	const path = `${document.baseURI}img/textures/skies/${name}/`;

	return [
		path + "right" + format, path + "left" + format,
		path + "top" + format, path + "bottom" + format,
		path + "front" + format, path + "back" + format
	];

}
