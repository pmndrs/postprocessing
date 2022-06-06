/**
 * A navigation manager.
 *
 * @implements {Initializable}
 */

export class NavigationManager {

	initialize() {

		const nav = document.querySelector(".navigation");
		const main = document.getElementById("main");
		nav.scrollTop = Number(sessionStorage.getItem("nav-scroll"));
		main.scrollTop = Number(sessionStorage.getItem("main-scroll"));
		sessionStorage.removeItem("nav-scroll");
		sessionStorage.removeItem("main-scroll");

		let saveMainScroll = true, saveNavScroll = true;
		function resetMainScroll() { saveMainScroll = false; }
		function resetNavScroll() { saveNavScroll = false; }

		for(const a of document.querySelectorAll("a")) {

			if(a.target !== "_blank") {

				a.addEventListener("click", resetMainScroll);

			}

		}

		document.querySelector(".page-title a").addEventListener("click", resetNavScroll);

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
