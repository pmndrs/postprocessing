/**
 * A sidebar manager.
 *
 * @implements {Initializable}
 */

export class SidebarManager {

	initialize() {

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
			const closeButtonVisible = (sidebarButtonClose.offsetParent !== null);

			if(closeButtonVisible && node !== sidebarButtonOpen && !sidebar.contains(node)) {

				sidebar.classList.remove("active");
				sidebarButtonOpen.classList.remove("hidden");

			}

		});

	}

}
