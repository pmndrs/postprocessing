/**
 * Prevents the white flash on navigation in dark mode.
 */

if(localStorage.getItem("dark-mode") === "enabled") {

	document.documentElement.classList.add("dark");

}
