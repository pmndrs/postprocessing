import { App } from "./app.js";

/**
 * The program entry point.
 *
 * @class Main
 * @static
 */

/**
 * Starts the program.
 *
 * @method main
 * @private
 * @static
 * @param {Event} event - An event.
 */

window.addEventListener("load", function main(event) {

	const viewport = document.getElementById("viewport");
	const loadingMessage = viewport.children[0];
	const aside = document.getElementById("aside");

	const app = new App();

	window.removeEventListener("load", main);
	aside.style.visibility = "visible";

	app.initialise(viewport, aside, loadingMessage);

});
