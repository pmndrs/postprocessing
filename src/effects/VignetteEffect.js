import { Uniform } from "three";
import { VignetteTechnique } from "../enums/VignetteTechnique.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/vignette.frag";

/**
 * A Vignette effect.
 */

export class VignetteEffect extends Effect {

	/**
	 * Constructs a new Vignette effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {VignetteTechnique} [options.technique=VignetteTechnique.DEFAULT] - The Vignette technique.
	 * @param {Boolean} [options.eskil=false] - Deprecated. Use technique instead.
	 * @param {Number} [options.offset=0.5] - The Vignette offset.
	 * @param {Number} [options.darkness=0.5] - The Vignette darkness.
	 */

	constructor({
		blendFunction,
		eskil = false,
		technique = eskil ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT,
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
	 * The Vignette technique.
	 *
	 * @type {VignetteTechnique}
	 */

	get technique() {

		return Number(this.defines.get("VIGNETTE_TECHNIQUE"));

	}

	set technique(value) {

		if(this.technique !== value) {

			this.defines.set("VIGNETTE_TECHNIQUE", value.toFixed(0));
			this.setChanged();

		}

	}

	/**
	 * Indicates whether Eskil's Vignette technique is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use technique instead.
	 */

	get eskil() {

		return (this.technique === VignetteTechnique.ESKIL);

	}

	/**
	 * Indicates whether Eskil's Vignette technique is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use technique instead.
	 */

	set eskil(value) {

		this.technique = value ? VignetteTechnique.ESKIL : VignetteTechnique.DEFAULT;

	}

	/**
	 * Returns the Vignette technique.
	 *
	 * @deprecated Use technique instead.
	 * @return {VignetteTechnique} The technique.
	 */

	getTechnique() {

		return this.technique;

	}

	/**
	 * Sets the Vignette technique.
	 *
	 * @deprecated Use technique instead.
	 * @param {VignetteTechnique} value - The technique.
	 */

	setTechnique(value) {

		this.technique = value;

	}

	/**
	 * The Vignette offset.
	 *
	 * @type {Number}
	 */

	get offset() {

		return this.uniforms.get("offset").value;

	}

	set offset(value) {

		this.uniforms.get("offset").value = value;

	}

	/**
	 * Returns the Vignette offset.
	 *
	 * @deprecated Use offset instead.
	 * @return {Number} The offset.
	 */

	getOffset() {

		return this.offset;

	}

	/**
	 * Sets the Vignette offset.
	 *
	 * @deprecated Use offset instead.
	 * @param {Number} value - The offset.
	 */

	setOffset(value) {

		this.offset = value;

	}

	/**
	 * The Vignette darkness.
	 *
	 * @type {Number}
	 */

	get darkness() {

		return this.uniforms.get("darkness").value;

	}

	set darkness(value) {

		this.uniforms.get("darkness").value = value;

	}

	/**
	 * Returns the Vignette darkness.
	 *
	 * @deprecated Use darkness instead.
	 * @return {Number} The darkness.
	 */

	getDarkness() {

		return this.darkness;

	}

	/**
	 * Sets the Vignette darkness.
	 *
	 * @deprecated Use darkness instead.
	 * @param {Number} value - The darkness.
	 */

	setDarkness(value) {

		this.darkness = value;

	}

}
