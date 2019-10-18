import { LoadingManager } from "three";
import { RawImageData } from "../../RawImageData.js";
import workerProgram from "./worker.tmp";

/**
 * Generates the SMAA data images.
 *
 * @private
 * @return {Promise} A promise that returns the search image and area image blobs.
 */

function generate() {

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

			if(window.localStorage !== undefined) {

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
 * This loader uses a worker thread to generate the search and area images.
 */

export class SMAAImageLoader {

	/**
	 * Constructs a new SMAA image loader.
	 *
	 * @param {LoadingManager} [loadingManager] - A loading manager.
	 */

	constructor(loadingManager = new LoadingManager()) {

		/**
		 * A loading manager.
		 *
		 * @type {LoadingManager}
		 */

		this.loadingManager = loadingManager;

	}

	/**
	 * Loads the SMAA data images.
	 *
	 * @param {Function} [onLoad] - A function to call when the loading process is done.
	 * @param {Function} [onError] - A function to call when an error occurs.
	 * @return {Promise} A promise that returns the search image and area image as a tupel.
	 */

	load(onLoad = () => {}, onError = () => {}) {

		const primaryManager = this.loadingManager;
		const secondaryManager = new LoadingManager();

		primaryManager.itemStart("smaa-search");
		primaryManager.itemStart("smaa-area");
		secondaryManager.itemStart("smaa-search");
		secondaryManager.itemStart("smaa-area");

		return new Promise((resolve, reject) => {

			const result = {
				search: new Image(),
				area: new Image()
			};

			secondaryManager.onLoad = () => {

				onLoad(result);
				resolve(result);

			};

			const cachedURLs = (window.localStorage !== undefined) ? [
				localStorage.getItem("smaa-search"),
				localStorage.getItem("smaa-area")
			] : [null, null];

			const promise = (cachedURLs[0] !== null && cachedURLs[1] !== null) ?
				Promise.resolve(cachedURLs) : generate();

			promise.then((urls) => {

				result.search.addEventListener("load", () => {

					primaryManager.itemEnd("smaa-search");
					secondaryManager.itemEnd("smaa-search");

				});

				result.area.addEventListener("load", () => {

					primaryManager.itemEnd("smaa-area");
					secondaryManager.itemEnd("smaa-area");

				});

				result.search.src = urls[0];
				result.area.src = urls[1];

			}).catch((error) => {

				primaryManager.itemError("smaa-search");
				primaryManager.itemError("smaa-area");

				onError(error);
				reject(error);

			});

		});

	}

}
