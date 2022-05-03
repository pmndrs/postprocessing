/**
 * A navigation manager.
 *
 * @implements {Initializable}
 */

export class NavigationManager {

	initialize() {

		const sidebar = document.querySelector(".sidebar");
		const nav = document.querySelector(".navigation");
		const main = document.getElementById("main");
		nav.scrollTop = Number(sessionStorage.getItem("nav-scroll"));
		main.scrollTop = Number(sessionStorage.getItem("main-scroll"));
		sessionStorage.removeItem("nav-scroll");
		sessionStorage.removeItem("main-scroll");

		let saveMainScroll = true;

		function resetMainScroll() {

			saveMainScroll = false;

		}

		for(const a of sidebar.querySelectorAll("a")) {

			if(a.target !== "_blank") {

				a.addEventListener("click", resetMainScroll);

			}

		}

		window.addEventListener("beforeunload", () => {

			sessionStorage.setItem("nav-scroll", nav.scrollTop.toFixed(0));

			if(saveMainScroll) {

				sessionStorage.setItem("main-scroll", main.scrollTop.toFixed(0));

			}

		});

	}

}
