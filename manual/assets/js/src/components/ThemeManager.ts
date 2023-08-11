import { Component } from "./Component.js";

/**
 * A theme manager.
 */

export class ThemeManager implements Component {

	/**
	 * Enables or disables dark mode.
	 *
	 * @param enabled - Whether dark mode should be enabled.
	 */

	private setDarkModeEnabled(enabled: boolean): void {

		if(enabled) {

			localStorage.setItem("dark-mode", "1");
			document.documentElement.classList.add("dark");

		} else {

			localStorage.removeItem("dark-mode");
			document.documentElement.classList.remove("dark");

		}

	}

	initialize() {

		const themeSwitch = document.querySelector(".dark-mode");
		themeSwitch?.addEventListener("click", () => this.setDarkModeEnabled(localStorage.getItem("dark-mode") === null));

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", (e) => this.setDarkModeEnabled(e.matches));
		this.setDarkModeEnabled(mediaQuery.matches || localStorage.getItem("dark-mode") !== null);

	}

}
