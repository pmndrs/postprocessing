/**
 * A progress text element.
 *
 * @type {HTMLElement}
 * @private
 */

let progressText = null;

/**
 * A progress bar.
 *
 * @type {HTMLElement}
 * @private
 */

let progressBar = null;

/**
 * A progress manager.
 */

export class ProgressManager {

	/**
	 * Initializes the progress manager.
	 */

	static initialize() {

		progressText = document.querySelector(".progress-text");
		progressBar = document.querySelector(".progress-bar > div");

	}

	/**
	 * Sets the loading progress.
	 *
	 * @param {Number} url - The current item's URL.
	 * @param {Number} loaded - The amount of loaded items.
	 * @param {Number} total - The amount of total items.
	 */

	static updateProgress(url, loaded, total) {

		const progress = (loaded / total * 100.0);
		progressText.innerText = loaded + " / " + total;
		progressBar.style.width = progress.toFixed(0) + "%";

	}

	/**
	 * Resets the loading progress.
	 */

	static reset() {

		progressText.innerHTML = "";
		progressBar.removeAttribute("style");

	}

}
