import { Component } from "./Component.js";

/**
 * A navigation manager.
 */

export class NavigationManager implements Component {

	/**
	 * Initializes scroll state restoration.
	 *
	 * This feature saves the scroll offset of the navigation sidebar and restores it on page load.
	 */

	private initializeScrollRecall() {

		const nav = document.querySelector(".navigation");
		const main = document.getElementById("main");
		const titleLink = document.querySelector(".page-title a");

		if(nav === null || main === null || titleLink === null) {

			return;

		}

		sessionStorage.removeItem("nav-scroll");
		sessionStorage.removeItem("main-scroll");

		let saveMainScroll = true;
		let saveNavScroll = true;
		function resetMainScroll() { saveMainScroll = false; }
		function resetNavScroll() { saveNavScroll = false; }

		for(const a of document.querySelectorAll("a")) {

			if(a.target !== "_blank") {

				a.addEventListener("click", resetMainScroll);

			}

		}

		titleLink.addEventListener("click", resetNavScroll);

		window.addEventListener("beforeunload", () => {

			if(saveNavScroll) {

				sessionStorage.setItem("nav-scroll", nav.scrollTop.toFixed(0));

			}

			if(saveMainScroll) {

				sessionStorage.setItem("main-scroll", main.scrollTop.toFixed(0));

			}

		});

	}

	/**
	 * Initializes navigation menu features.
	 */

	private initializeNavMenus() {

		const nav = document.querySelector(".navigation");

		if(nav === null) {

			return;

		}

		function onClick(event: Event): void {

			const element = event.target as HTMLElement | null;
			element?.parentElement?.classList?.toggle("expanded");

		}

		for(const h of nav.querySelectorAll("h2, h3")) {

			h.addEventListener("click", onClick);

		}

		window.addEventListener("beforeunload", () => {

			// Save the current menu state.
			const expandedMenus = Array.from(nav.querySelectorAll<HTMLLIElement>(".menu.expanded"));
			const ids = expandedMenus.map(x => x.dataset.id);
			localStorage.setItem("expanded-menus", JSON.stringify(ids));

		});

	}

	initialize() {

		this.initializeScrollRecall();
		this.initializeNavMenus();

	}

}
