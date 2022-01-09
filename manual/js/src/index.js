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

window.addEventListener("DOMContentLoaded", () => {

	// Dark Mode

	if(localStorage.getItem("dark-mode") !== null) {

		document.body.classList.add("dark");

	}

	const darkModeSwitch = document.querySelector(".dark-mode");
	darkModeSwitch.addEventListener("click", () => {

		document.body.classList.toggle("dark");

		if(localStorage.getItem("dark-mode") !== null) {

			localStorage.removeItem("dark-mode");

		} else {

			localStorage.setItem("dark-mode", "1");

		}

	});

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

					// Remove the loading animation when the canvas is added to the viewport.
					const loading = document.querySelector(".loading");
					loading.classList.add("hidden");
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
