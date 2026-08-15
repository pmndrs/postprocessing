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

			localStorage.setItem("dark-mode", "enabled");
			document.documentElement.classList.add("dark");

		} else {

			localStorage.setItem("dark-mode", "disabled");
			document.documentElement.classList.remove("dark");

		}

	}

	/**
	 * Toggles dark mode.
	 */

	private toggleDarkMode(): void {

		const enabled = localStorage.getItem("dark-mode") === "enabled";
		this.setDarkModeEnabled(!enabled);

	}

	initialize() {

		const darkModeValue = localStorage.getItem("dark-mode");
		const themeSwitch = document.querySelector(".dark-mode");
		themeSwitch?.addEventListener("click", () => this.toggleDarkMode());

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", (e) => this.setDarkModeEnabled(e.matches));

		if(darkModeValue === null) {

			this.setDarkModeEnabled(mediaQuery.matches);

		}

	}

}
