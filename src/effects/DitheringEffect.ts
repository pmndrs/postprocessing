import { Uniform } from "three";
import { DitheringType } from "../enums/DitheringType.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/dithering.frag";

/**
 * DitheringEffect options.
 *
 * @category Effects
 */

export interface DitheringEffectOptions {

	/**
     * The dithering intensity.
     *
     * @defaultValue 1.0
     */

	intensity?: number;

	/**
     * The dithering type.
     *
     * @defaultValue DitheringType.LUMABASED
     */

	ditheringType?: DitheringType;
}

/**
 * A dithering effect.
 *
 * @category Effects
 */

export class DitheringEffect extends Effect {

	/**
     * Constructs a new dithering effect.
     *
     * @param options - The options.
     */

	constructor({
		intensity = 1.0,
		ditheringType = DitheringType.LUMABASED
	}: DitheringEffectOptions = {}) {

		super("DitheringEffect");

		this.fragmentShader = fragmentShader;
		this.ditheringType = ditheringType;

		this.input.uniforms.set("intensity", new Uniform(intensity));

	}

	/**
     * The dithering type.
     */

	get ditheringType(): DitheringType {

		return this.input.defines.get("DITHERING_TYPE") as DitheringType;

	}

	set ditheringType(value: DitheringType) {

		if(this.ditheringType !== value) {

         this.input.defines.set("DITHERING_TYPE", value);
			this.setChanged();

		}

	}

	/**
     * The dithering intensity.
     */

	get intensity(): number {

		return this.input.uniforms.get("intensity")!.value as number;

	}

	set intensity(value: number) {

		this.input.uniforms.get("intensity")!.value = value;

	}

}
