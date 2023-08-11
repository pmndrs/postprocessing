import { Component } from "./Component.js";

/**
 * A navigation manager.
 */

export class NavigationManager implements Component {

	initialize() {

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

}
