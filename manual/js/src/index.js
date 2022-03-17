import { NavigationManager, SidebarManager, ThemeManager, ViewportManager } from "./components";
import { require } from "./shims/require";
Object.assign(window, { require });

/**
 * Performs tasks when the DOM content is ready.
 *
 * @param event - An event.
 */

window.addEventListener("DOMContentLoaded", (event) => {

	const components = [
		new NavigationManager(),
		new SidebarManager(),
		new ThemeManager(),
		new ViewportManager()
	];

	for(const component of components) {

		component.initialize();

	}

});

/**
 * Performs tasks when the page has been fully loaded.
 *
 * @param event - An event.
 */

window.addEventListener("load", (event) => {

	document.body.classList.remove("preload");

});
