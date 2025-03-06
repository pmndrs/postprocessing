import { LoadingManager } from "three";
import { RawImageData } from "../RawImageData.js";
import workerProgram from "../../../temp/smaa/worker.txt";

/**
 * Generates the SMAA data images.
 *
 * @private
 * @param {Boolean} [useCache=true] - Determines whether the generated image data should be cached.
 * @return {Promise} A promise that returns the search image and area image as a data URL pair.
 */

function generate(useCache = true) {

	const workerURL = URL.createObjectURL(new Blob([workerProgram], {
		type: "text/javascript"
	}));

	const worker = new Worker(workerURL);
	URL.revokeObjectURL(workerURL);

	return new Promise((resolve, reject) => {

		worker.addEventListener("error", (event) => reject(event.error));
		worker.addEventListener("message", (event) => {

			const searchImageData = RawImageData.from(event.data.searchImageData);
			const areaImageData = RawImageData.from(event.data.areaImageData);

			const urls = [
				searchImageData.toCanvas().toDataURL("image/png", 1.0),
				areaImageData.toCanvas().toDataURL("image/png", 1.0)
			];

			if(useCache) {

				localStorage.setItem("smaa-search", urls[0]);
				localStorage.setItem("smaa-area", urls[1]);

			}

			resolve(urls);

		});

		worker.postMessage(null);

	});

}

/**
 * An SMAA image generator.
 *
 * This class uses a worker thread to generate the search and area images. The generated data URLs will be cached using
 * localStorage, if available. To disable caching use {@link SMAAImageGenerator.setCacheEnabled}.
 */

export class SMAAImageGenerator {

	/**
	 * Constructs a new SMAA image generator.
	 */

	constructor() {

		/**
		 * Indicates whether data image caching is disabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use setCacheEnabled() instead.
		 */

		this.disableCache = false;

	}

	/**
	 * Enables or disables caching via localStorage.
	 *
	 * @param {Boolean} value - Whether the cache should be enabled.
	 */

	setCacheEnabled(value) {

		this.disableCache = !value;

	}

	/**
	 * Generates the SMAA data images.
	 *
	 * @example
	 * SMAAImageGenerator.generate().then(([search, area]) => {
	 *   const smaaEffect = new SMAAEffect(search, area);
	 * });
	 * @return {Promise<Image[]>} A promise that returns the search image and area image as a pair.
	 */

	generate() {

		const useCache = (!this.disableCache && window.localStorage !== undefined);

		const cachedURLs = useCache ? [
			localStorage.getItem("smaa-search"),
			localStorage.getItem("smaa-area")
		] : [null, null];

		const promise = (cachedURLs[0] !== null && cachedURLs[1] !== null) ?
			Promise.resolve(cachedURLs) : generate(useCache);

		return promise.then((urls) => {

			return new Promise((resolve, reject) => {

				const searchImage = new Image();
				const areaImage = new Image();

				const manager = new LoadingManager();
				manager.onLoad = () => resolve([searchImage, areaImage]);
				manager.onError = reject;

				searchImage.addEventListener("error", (e) => manager.itemError("smaa-search"));
				areaImage.addEventListener("error", (e) => manager.itemError("smaa-area"));
				searchImage.addEventListener("load", () => manager.itemEnd("smaa-search"));
				areaImage.addEventListener("load", () => manager.itemEnd("smaa-area"));
				manager.itemStart("smaa-search");
				manager.itemStart("smaa-area");
				searchImage.src = urls[0];
				areaImage.src = urls[1];

			});

		});

	}

}
