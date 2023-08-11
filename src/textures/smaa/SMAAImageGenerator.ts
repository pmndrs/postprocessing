import { LoadingManager } from "three";
import { RawImageData } from "../RawImageData.js";
import workerProgram from "temp/smaa/worker.txt";

interface SMAAImageData {

	searchImageData: ImageData;
	areaImageData: ImageData;

}

/**
 * Generates the SMAA data images.
 *
 * @param useCache - Determines whether the generated image data should be cached.
 * @return A promise that returns the search image and area image as a data URL pair.
 */

function generate(useCache = true): Promise<string[]> {

	const workerURL = URL.createObjectURL(new Blob([workerProgram], {
		type: "text/javascript"
	}));

	const worker = new Worker(workerURL);
	URL.revokeObjectURL(workerURL);

	return new Promise((resolve, reject) => {

		worker.addEventListener("error", (event) => reject(event.error));
		worker.addEventListener("message", (event: MessageEvent<SMAAImageData>) => {

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
 * localStorage, if available. To disable caching set {@link cacheEnabled} to `false`.
 *
 * @group Textures
 */

export class SMAAImageGenerator {

	/**
	 * Indicates whether data image caching is enabled. Default is true.
	 */

	cacheEnabled: boolean;

	/**
	 * Constructs a new SMAA image generator.
	 */

	constructor() {

		this.cacheEnabled = true;

	}

	/**
	 * Generates the SMAA data images.
	 *
	 * @example
	 * SMAAImageGenerator.generate().then(([search, area]) => {
	 *   const smaaEffect = new SMAAEffect(search, area);
	 * });
	 * @return A promise that returns the search image and area image as a pair.
	 */

	async generate(): Promise<HTMLImageElement[]> {

		const useCache = (this.cacheEnabled && window.localStorage !== undefined);

		const cachedURLs = useCache ? [
			localStorage.getItem("smaa-search"),
			localStorage.getItem("smaa-area")
		] : [null, null];

		const promise = (cachedURLs[0] !== null && cachedURLs[1] !== null) ?
			Promise.resolve(cachedURLs) : generate(useCache);

		const urls = await promise;
		return await new Promise((resolve, reject) => {

			const searchImage = new Image();
			const areaImage = new Image();

			const manager = new LoadingManager();
			manager.onLoad = () => resolve([searchImage, areaImage]);
			manager.onError = reject;

			searchImage.addEventListener("error", () => manager.itemError("smaa-search"));
			areaImage.addEventListener("error", () => manager.itemError("smaa-area"));
			searchImage.addEventListener("load", () => manager.itemEnd("smaa-search"));
			areaImage.addEventListener("load", () => manager.itemEnd("smaa-area"));
			manager.itemStart("smaa-search");
			manager.itemStart("smaa-area");
			searchImage.src = urls[0] as string;
			areaImage.src = urls[1] as string;

		});

	}

}
