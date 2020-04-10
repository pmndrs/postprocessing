import { Loader, LoadingManager } from "three";
import { RawImageData } from "../../RawImageData.js";
import workerProgram from "./worker.tmp";

/**
 * Generates the SMAA data images.
 *
 * @private
 * @param {Boolean} [disableCache=false] - Determines whether the generated image data should be cached.
 * @return {Promise} A promise that returns the search image and area image as a data URL pair.
 */

function generate(disableCache = false) {

	const workerURL = URL.createObjectURL(new Blob([workerProgram], { type: "text/javascript" }));
	const worker = new Worker(workerURL);

	return new Promise((resolve, reject) => {

		worker.addEventListener("error", (event) => reject(event.error));
		worker.addEventListener("message", (event) => {

			const searchImageData = RawImageData.from(event.data.searchImageData);
			const areaImageData = RawImageData.from(event.data.areaImageData);

			const urls = [
				searchImageData.toCanvas().toDataURL(),
				areaImageData.toCanvas().toDataURL()
			];

			if(!disableCache && window.localStorage !== undefined) {

				localStorage.setItem("smaa-search", urls[0]);
				localStorage.setItem("smaa-area", urls[1]);

			}

			URL.revokeObjectURL(workerURL);
			resolve(urls);

		});

		worker.postMessage(null);

	});

}

/**
 * An SMAA image loader.
 *
 * This loader uses a worker thread to generate the search and area images. The
 * Generated data URLs will be cached using localStorage, if available. To
 * disable caching, please refer to {@link SMAAImageLoader.disableCache}.
 *
 * @experimental Added for testing, API might change in patch or minor releases. Requires three >= r108.
 */

export class SMAAImageLoader extends Loader {

	/**
	 * Constructs a new SMAA image loader.
	 *
	 * @param {LoadingManager} [manager] - A loading manager.
	 */

	constructor(manager) {

		super(manager);

		/**
		 * Indicates whether data image caching is disabled.
		 *
		 * @type {Boolean}
		 */

		this.disableCache = false;

	}

	/**
	 * Loads the SMAA data images.
	 *
	 * @param {Function} [onLoad] - A function to call when the loading process is done.
	 * @param {Function} [onError] - A function to call when an error occurs.
	 * @return {Promise} A promise that returns the search image and area image as a pair.
	 */

	load(onLoad = () => {}, onError = () => {}) {

		// Conform to the signature (url, onLoad, onProgress, onError).
		if(arguments.length === 4) {

			onLoad = arguments[1];
			onError = arguments[3];

		} else if(arguments.length === 3 || typeof arguments[0] !== "function") {

			onLoad = arguments[1];
			onError = () => {};

		}

		const externalManager = this.manager;
		const internalManager = new LoadingManager();

		externalManager.itemStart("smaa-search");
		externalManager.itemStart("smaa-area");
		internalManager.itemStart("smaa-search");
		internalManager.itemStart("smaa-area");

		return new Promise((resolve, reject) => {

			const cachedURLs = (!this.disableCache && window.localStorage !== undefined) ? [
				localStorage.getItem("smaa-search"),
				localStorage.getItem("smaa-area")
			] : [null, null];

			const promise = (cachedURLs[0] !== null && cachedURLs[1] !== null) ?
				Promise.resolve(cachedURLs) : generate(this.disableCache);

			promise.then((urls) => {

				const result = [new Image(), new Image()];

				internalManager.onLoad = () => {

					onLoad(result);
					resolve(result);

				};

				result[0].addEventListener("load", () => {

					externalManager.itemEnd("smaa-search");
					internalManager.itemEnd("smaa-search");

				});

				result[1].addEventListener("load", () => {

					externalManager.itemEnd("smaa-area");
					internalManager.itemEnd("smaa-area");

				});

				result[0].src = urls[0];
				result[1].src = urls[1];

			}).catch((error) => {

				externalManager.itemError("smaa-search");
				externalManager.itemError("smaa-area");

				onError(error);
				reject(error);

			});

		});

	}

}
