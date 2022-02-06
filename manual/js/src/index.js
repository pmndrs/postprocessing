/**
 * A require shim for external bundles.
 */

window.require = (name) => {

	let module;

	switch(name) {

		case "three":
			module = window.THREE;
			break;

		default:
			throw new Error(`Cannot require ${name}`);

	}

	return module;

};

window.addEventListener("load", () => {

	document.body.classList.remove("preload");

});

window.addEventListener("DOMContentLoaded", () => {

	// Dark Mode

	function setDarkModeEnabled(enabled) {

		if(enabled) {

			localStorage.setItem("dark-mode", "1");
			document.body.classList.add("dark");

		} else {

			localStorage.removeItem("dark-mode");
			document.body.classList.remove("dark");

		}

	}

	const darkModeSwitch = document.querySelector(".dark-mode");
	darkModeSwitch.addEventListener("click", () => setDarkModeEnabled(localStorage.getItem("dark-mode") === null));

	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	mediaQuery.addEventListener("change", (e) => setDarkModeEnabled(e.matches));
	setDarkModeEnabled(mediaQuery.matches || localStorage.getItem("dark-mode") !== null);

	// Sidebar Drawer

	const sidebar = document.querySelector(".sidebar");
	const sidebarButtonOpen = document.querySelector(".sidebar-button-open");
	const sidebarButtonClose = document.querySelector(".sidebar-button-close");

	sidebarButtonOpen.addEventListener("click", () => {

		sidebar.classList.add("active");
		sidebarButtonOpen.classList.add("hidden");

	});

	sidebarButtonClose.addEventListener("click", () => {

		sidebar.classList.remove("active");
		sidebarButtonOpen.classList.remove("hidden");

	});

	document.body.addEventListener("click", (event) => {

		const node = event.target;
		const closeButtonVisible = sidebarButtonClose.offsetParent !== null;

		if(closeButtonVisible && node !== sidebarButtonOpen && !sidebar.contains(node)) {

			sidebar.classList.remove("active");
			sidebarButtonOpen.classList.remove("hidden");

		}

	});

	// Viewport

	const viewport = document.querySelector(".viewport");

	if(viewport !== null) {

		// Loading Animation

		const observer = new MutationObserver((mutationsList, observer) => {

			for(const mutation of mutationsList) {

				if(mutation.type === "childList") {

					// Stop the loading animation when the canvas is added to the viewport.
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

		// Info Box

		const info = viewport.querySelector(".info");

		if(info !== null) {

			info.addEventListener("click", () => info.classList.toggle("active"));

		}

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

});
