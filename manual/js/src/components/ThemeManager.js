/**
 * A theme manager.
 *
 * @implements {Initializable}
 */

export class ThemeManager {

	/**
	 * Enables or disables dark mode.
	 *
	 * @private
	 * @param {Boolean} enabled - Whether dark mode should be enabled.
	 */

	setDarkModeEnabled(enabled) {

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
		themeSwitch.addEventListener("click", () => this.setDarkModeEnabled(localStorage.getItem("dark-mode") === null));

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", (e) => this.setDarkModeEnabled(e.matches));
		this.setDarkModeEnabled(mediaQuery.matches || localStorage.getItem("dark-mode") !== null);

		// Prevent white flash during navigation.
		document.body.style.visibility = "visible";
		document.body.style.opacity = 1;

	}

}
