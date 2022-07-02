/**
 * A viewport manager.
 *
 * @implements {Initializable}
 */

export class ViewportManager {

	constructor() {

		/**
		 * The viewport.
		 *
		 * @private
		 * @type {HTMLElement}
		 */

		this.viewport = null;

		/**
		 * A fullscreen button.
		 *
		 * @private
		 * @type {HTMLElement}
		 */

		this.fullscreenButton = null;

		/**
		 * Indicates whether scrolling should currently be prevented.
		 *
		 * @private
		 * @type {Boolean}
		 */

		this.preventScrolling = false;

	}

	/**
	 * Shows an error message.
	 *
	 * @private
	 * @param {String} message - The error message.
	 */

	showErrorMessage(message) {

		const viewport = this.viewport;
		const canvas = viewport.querySelector("canvas");
		const warning = viewport.querySelector(".warning");
		const error = viewport.querySelector(".error");
		const p = error.querySelector("p");
		p.innerText = message;

		viewport.classList.remove("loading");
		warning.classList.add("hidden");
		canvas.classList.add("hidden");
		error.classList.remove("hidden");

	}

	/**
	 * Shows an epilepsy warning.
	 *
	 * @private
	 */

	showEpilepsyWarning() {

		const viewport = this.viewport;
		const canvas = viewport.querySelector("canvas");
		const warning = viewport.querySelector(".warning");
		const tp = viewport.querySelector(".tp");
		const a = warning.querySelector("a");

		tp.classList.toggle("hidden");
		canvas.classList.toggle("hidden");
		warning.classList.toggle("hidden");

		a.addEventListener("click", (event) => {

			event.preventDefault();
			sessionStorage.setItem("epilepsy-warning", "1");
			warning.classList.toggle("hidden");
			canvas.classList.toggle("hidden");
			tp.classList.toggle("hidden");

		});

	}

	/**
	 * Handles scroll events.
	 *
	 * @private
	 * @param {Event} event - The event.
	 */

	handleScroll(event) {

		if(this.preventScrolling) {

			event.preventDefault();

		}

	}

	/**
	 * Toggles fullscreen mode.
	 *
	 * @private
	 */

	toggleFullscreen() {

		if(document.fullscreenEnabled) {

			if(document.fullscreenElement !== null) {

				document.exitFullscreen();

			} else {

				this.viewport.requestFullscreen();

			}

		}

	}

	handleEvent(event) {

		switch(event.type) {

			case "mouseenter":
				this.preventScrolling = true;
				break;

			case "mouseleave":
				this.preventScrolling = false;
				break;

			case "wheel":
				this.handleScroll(event);
				break;

			case "click":
				this.toggleFullscreen();
				break;

			case "fullscreenchange":
				this.fullscreenButton.classList.toggle("active");
				break;

			case "unhandledrejection":
				this.showErrorMessage(event.reason.message);
				break;

		}

	}

	initialize() {

		const viewport = this.viewport = document.querySelector(".viewport");

		if(viewport !== null) {

			// Error Handling

			window.addEventListener("unhandledrejection", this);

			// Scrolling

			const main = document.getElementById("main");
			main.addEventListener("wheel", this);
			viewport.addEventListener("mouseenter", this);
			viewport.addEventListener("mouseleave", this);

			// Fullscreen

			const fullscreenButton = this.fullscreenButton = viewport.querySelector(".fullscreen");
			fullscreenButton.addEventListener("click", this);
			document.addEventListener("fullscreenchange", this);

			// Loading Animation

			const observer = new MutationObserver((mutationsList, observer) => {

				for(const mutation of mutationsList) {

					if(mutation.type === "childList") {

						// Stop the loading animation when something is added to the viewport.
						viewport.classList.remove("loading");

						// Show an epilepsy warning if applicable.
						const alreadyShown = (sessionStorage.getItem("epilepsy-warning") !== null);

						if(viewport.dataset.epilepsyWarning && !alreadyShown) {

							this.showEpilepsyWarning();

						}

						observer.disconnect();

					}

				}

			});

			observer.observe(viewport, { childList: true });

		}

	}

}
