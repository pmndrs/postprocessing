/**
 * Restores the menu expansion state.
 */

function restoreMenuState(): void {

	const nav = document.querySelector(".navigation");
	const expandedMenusJSON = sessionStorage.getItem("expanded-menus");
	const expandedMenus = (expandedMenusJSON !== null) ? JSON.parse(expandedMenusJSON) as string[] : null;

	if(nav === null || expandedMenus === null || !Array.isArray(expandedMenus) || expandedMenus.length === 0) {

		return;

	}

	for(const menu of nav.querySelectorAll(".menu")) {

		menu.classList.remove("expanded");

	}

	try {

		for(const menu of nav.querySelectorAll(expandedMenus.map(id => `.menu.${id}`).join(","))) {

			menu.classList.add("expanded");

		}

	} catch(e) {

		sessionStorage.removeItem("expanded-menus");
		window.location.reload();

	}

}

/**
 * Restores scroll positions.
 */

function restoreScroll(): void {

	const nav = document.querySelector(".navigation");
	const main = document.querySelector("main");

	if(nav !== null && main !== null) {

		nav.scrollTop = Number(sessionStorage.getItem("nav-scroll"));
		main.scrollTop = Number(sessionStorage.getItem("main-scroll"));

	}

}

restoreMenuState();
restoreScroll();
