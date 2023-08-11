import { NavigationManager } from "./components/NavigationManager.js";
import { SidebarManager } from "./components/SidebarManager.js";
import { ThemeManager } from "./components/ThemeManager.js";
import { ViewportManager } from "./components/ViewportManager.js";
import { require } from "./shims/require.js";
Object.assign(window, { require });

window.addEventListener("DOMContentLoaded", () => {

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

window.addEventListener("load", () => {

	document.body.classList.remove("preload");

});
