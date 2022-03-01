/**
 * A viewport manager.
 *
 * @implements {Initializable}
 */

export class ViewportManager {

	/**
	 * Shows n error message.
	 *
	 * @private
	 * @param {String} message - The error message.
	 */

	showErrorMessage(message) {

		const container = document.querySelector(".viewport");
		const p = document.createElement("p");
		p.classList.add("error");
		p.innerText = message;
		container.append(p);

	}

	handleEvent(event) {

		switch(event.type) {

			case "unhandledrejection":
				this.showErrorMessage(event.reason.message);
				break;

		}

	}

	initialize() {

		const viewport = document.querySelector(".viewport");

		if(viewport !== null) {

			// Error Handling

			window.addEventListener("unhandledrejection", this);

			// Loading Animation

			const observer = new MutationObserver((mutationsList, observer) => {

				for(const mutation of mutationsList) {

					if(mutation.type === "childList") {

						// Stop the loading animation when something is added to the viewport.
						viewport.classList.remove("loading");
						observer.disconnect();

					}

				}

			});

			observer.observe(viewport, { childList: true });

			// Scrolling

			let preventScrolling = false;
			viewport.addEventListener("mouseenter", () => void (preventScrolling = true));
			viewport.addEventListener("mouseleave", () => void (preventScrolling = false));

			const main = document.getElementById("main");
			main.addEventListener("wheel", (e) => {

				if(preventScrolling) {

					e.preventDefault();

				}

				return !preventScrolling;

			});

			// Fullscreen

			const fullscreen = viewport.querySelector(".fullscreen");
			fullscreen.addEventListener("click", () => {

				if(document.fullscreenEnabled) {

					fullscreen.classList.toggle("active");

					if(document.fullscreenElement !== null) {

						document.exitFullscreen();

					} else {

						viewport.requestFullscreen();

					}

				}

			});

		}

	}

}
