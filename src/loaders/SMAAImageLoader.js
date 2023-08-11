import { Loader, LoadingManager } from "three";

import searchImageDataURL from "../textures/smaa/searchImageDataURL.js";
import areaImageDataURL from "../textures/smaa/areaImageDataURL.js";

/**
 * An SMAA image loader.
 *
 * @deprecated Preloading the SMAA lookup textures is no longer required.
 * @experimental Added for testing, API might change in patch or minor releases. Requires three >= r108.
 */

export class SMAAImageLoader extends Loader {

	/**
	 * Loads the SMAA data images.
	 *
	 * @param {Function} [onLoad] - A callback that receives the search image and area image as a pair.
	 * @param {Function} [onError] - An error callback that receives the URL of the image that failed to load.
	 * @return {Promise<Image[]>} A promise that returns the search image and area image as a pair.
	 */

	load(onLoad = () => {}, onError = null) {

		// Conform to the signature (url, onLoad, onProgress, onError).
		if(arguments.length === 4) {

			onLoad = arguments[1];
			onError = arguments[3];

		} else if(arguments.length === 3 || typeof arguments[0] !== "function") {

			onLoad = arguments[1];
			onError = null;

		}

		const externalManager = this.manager;
		const internalManager = new LoadingManager();

		return new Promise((resolve, reject) => {

			const searchImage = new Image();
			const areaImage = new Image();

			internalManager.onError = (url) => {

				externalManager.itemError(url);

				if(onError !== null) {

					onError(`Failed to load ${url}`);
					resolve();

				} else {

					reject(`Failed to load ${url}`);

				}

			};

			internalManager.onLoad = () => {

				const result = [searchImage, areaImage];
				onLoad(result);
				resolve(result);

			};

			searchImage.addEventListener("error", (e) => {

				internalManager.itemError("smaa-search");

			});

			areaImage.addEventListener("error", (e) => {

				internalManager.itemError("smaa-area");

			});

			searchImage.addEventListener("load", () => {

				externalManager.itemEnd("smaa-search");
				internalManager.itemEnd("smaa-search");

			});

			areaImage.addEventListener("load", () => {

				externalManager.itemEnd("smaa-area");
				internalManager.itemEnd("smaa-area");

			});

			externalManager.itemStart("smaa-search");
			externalManager.itemStart("smaa-area");
			internalManager.itemStart("smaa-search");
			internalManager.itemStart("smaa-area");

			searchImage.src = searchImageDataURL;
			areaImage.src = areaImageDataURL;

		});

	}

}
