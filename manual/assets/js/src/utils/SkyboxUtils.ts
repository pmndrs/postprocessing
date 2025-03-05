/**
 * Supported image formats.
 */

declare type ImageFormat = ".png" | ".jpg";

/**
 * Returns a list of skybox image URLs to load.
 *
 * @param name - The name of the cube map.
 * @param format - The image format. Default is ".png".
 * @return The URLs.
 */

export function getSkyboxUrls(name: string, format: ImageFormat = ".png"): string[] {

	const path = `${document.baseURI}img/textures/skies/${name}/`;

	return [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

}
