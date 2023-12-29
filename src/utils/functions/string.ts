/**
 * Prefixes substrings within the given strings.
 *
 * @param prefix - A prefix.
 * @param substrings - The substrings.
 * @param namedValues - A collection of named values such as shaders or macros.
 */

export function prefixSubstrings(prefix: string, substrings: Iterable<string>,
	namedValues: Map<string, string | number | boolean | null>): void {

	for(const substring of substrings) {

		// Prefix the substring and build a RegExp that searches for the unprefixed version.
		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

		for(const entry of namedValues.entries()) {

			if(typeof entry[1] === "string") {

				// Replace all occurances of the substring with the prefixed version.
				namedValues.set(entry[0], entry[1].replace(regExp, prefixed));

			}

		}

	}

}
