/**
 * Prevents the white flash on navigation in dark mode.
 */

if(localStorage.getItem("dark-mode") !== null) {

	document.documentElement.classList.add("dark");

} else {

	document.documentElement.classList.remove("dark");

}
