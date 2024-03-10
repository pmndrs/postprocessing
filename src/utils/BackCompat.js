import { REVISION } from "three";

const revision = Number(REVISION.replace(/\D+/g, ""));

/**
 * Updates the given fragment shader for the current version of three.
 *
 * @param {String} fragmentShader - A fragment shader.
 * @return {String} The modified fragment shader.
 * @ignore
 */

export function updateFragmentShader(fragmentShader) {

	if(revision < 154) {

		return fragmentShader.replace("colorspace_fragment", "encodings_fragment");

	}

	return fragmentShader;

}
