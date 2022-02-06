import { Uniform } from "three";
import { BlendFunction } from "./blending";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/vignette/shader.frag";

/**
 * An enumeration of vignette techniques.
 *
 * @type {Object}
 * @property {Number} DEFAULT - Produces a dusty look.
 * @property {Number} ESKIL - Produces a burned look.
 */

export const VignetteTechnique = {
	DEFAULT: 0,
	ESKIL: 1
};

/**
 * A vignette effect.
 */

export class VignetteEffect extends Effect {

	/**
	 * Constructs a new vignette effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {VignetteTechnique} [options.technique=VignetteTechnique.DEFAULT] - The vignette technique.
	 * @param {Boolean} [options.eskil=false] - Deprecated. Use technique instead.
	 * @param {Number} [options.offset=0.5] - The vignette offset.
	 * @param {Number} [options.darkness=0.5] - The vignette darkness.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		technique = VignetteTechnique.DEFAULT,
		eskil = false,
		offset = 0.5,
		darkness = 0.5
	} = {}) {

		super("VignetteEffect", fragmentShader, {
			blendFunction: blendFunction,
			defines: new Map([
				["VIGNETTE_TECHNIQUE", technique.toFixed(0)]
			]),
			uniforms: new Map([
				["offset", new Uniform(offset)],
				["darkness", new Uniform(darkness)]
			])
		});

	}

	/**
	 * Indicates whether Eskil's vignette technique is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use getTechnique() instead.
	 */

	get eskil() {

		return (this.getTechnique() === VignetteTechnique.ESKIL);

	}

	/**
	 * Indicates whether Eskil's vignette technique is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use setTechnique(VignetteTechnique.ESKIL) instead.
	 */

	set eskil(value) {

		this.setTechnique(value ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT);

	}

	/**
	 * Returns the vignette technique.
	 *
	 * @return {VignetteTechnique} The technique.
	 */

	getTechnique() {

		return Number(this.defines.get("VIGNETTE_TECHNIQUE"));

	}

	/**
	 * Sets the vignette technique.
	 *
	 * @param {VignetteTechnique} value - The technique.
	 */

	setTechnique(value) {

		if(this.getTechnique() !== value) {

			this.defines.set("VIGNETTE_TECHNIQUE", value.toFixed(0));
			this.setChanged();

		}

	}

	/**
	 * Returns the vignette offset.
	 *
	 * @return {Number} The offset.
	 */

	getOffset() {

		return this.uniforms.get("offset").value;

	}

	/**
	 * Sets the vignette offset.
	 *
	 * @param {Number} value - The offset.
	 */

	setOffset(value) {

		this.uniforms.get("offset").value = value;

	}

	/**
	 * Returns the vignette darkness.
	 *
	 * @return {Number} The darkness.
	 */

	getDarkness() {

		return this.uniforms.get("darkness").value;

	}

	/**
	 * Sets the vignette darkness.
	 *
	 * @param {Number} value - The darkness.
	 */

	setDarkness(value) {

		this.uniforms.get("darkness").value = value;

	}

}
