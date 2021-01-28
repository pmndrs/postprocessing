import { Loader, LoadingManager } from "three";

import searchImageDataURL from "../images/smaa/searchImageDataURL";
import areaImageDataURL from "../images/smaa/areaImageDataURL";

/**
 * An SMAA image loader.
 *
 * @experimental Added for testing, API might change in patch or minor releases. Requires three >= r108.
 */

export class SMAAImageLoader extends Loader {

	/**
	 * Loads the SMAA data images.
	 *
	 * @param {Function} [onLoad] - A function to call when the loading process is done.
	 * @param {Function} [onError] - A function to call when an error occurs.
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

			internalManager.onError = (item) => {

				if(onError !== null) {

					onError(`Failed to load ${item}`);
					resolve();

				} else {

					reject(`Failed to load ${item}`);

				}

			};

			internalManager.onLoad = () => {

				const result = [searchImage, areaImage];
				onLoad(result);
				resolve(result);

			};

			searchImage.addEventListener("error", (error) => {

				externalManager.itemError("smaa-search");
				internalManager.itemError("smaa-search");

			});

			areaImage.addEventListener("error", (error) => {

				externalManager.itemError("smaa-area");
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
