import { Color, Uniform, Vector2 } from "three";
import { VignetteTechnique } from "../enums/VignetteTechnique.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/vignette.frag";

/**
 * VignetteEffect options.
 *
 * @category Effects
 */

export interface VignetteEffectOptions {

	/**
	 * Defines the Vignette shape.
	 *
	 * @defaultValue {@link VignetteTechnique.DEFAULT}
	 */

	technique?: VignetteTechnique;

	/**
	 * The Vignette offset.
	 *
	 * @defaultValue 0.5
	 */

	offset?: number;

	/**
	 * The Vignette softness. Acts as a color scale when using {@link VignetteTechnique.ESKIL}.
	 *
	 * @defaultValue 0.5
	 */

	feather?: number;

	/**
	 * The Vignette color.
	 *
	 * @defaultValue 0x000000
	 */

	color?: Color | number;

}

/**
 * A vignette effect.
 *
 * @category Effects
 */

export class VignetteEffect extends Effect implements VignetteEffectOptions {

	/**
	 * Constructs a new vignette effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		technique = VignetteTechnique.DEFAULT,
		offset = 0.5,
		feather = 0.5,
		color = 0x000000
	}: VignetteEffectOptions = {}) {

		super("VignetteEffectOptions");

		this.fragmentShader = fragmentShader;
		this.technique = technique;

		const uniforms = this.input.uniforms;
		uniforms.set("offsetFeather", new Uniform(new Vector2(offset, feather)));
		uniforms.set("color", new Uniform(new Color(color)));

	}

	get technique(): VignetteTechnique {

		return this.input.defines.get("VIGNETTE_TECHNIQUE") as VignetteTechnique;

	}

	set technique(value: VignetteTechnique) {

		if(this.technique !== value) {

			this.input.defines.set("VIGNETTE_TECHNIQUE", value);
			this.setChanged();

		}

	}

	get offset(): number {

		const offsetFeather = this.input.uniforms.get("offsetFeather")!.value as Vector2;
		return offsetFeather.x;

	}

	set offset(value: number) {

		const offsetFeather = this.input.uniforms.get("offsetFeather")!.value as Vector2;
		offsetFeather.x = value;

	}

	get feather(): number {

		const offsetFeather = this.input.uniforms.get("offsetFeather")!.value as Vector2;
		return offsetFeather.y;

	}

	set feather(value: number) {

		const offsetFeather = this.input.uniforms.get("offsetFeather")!.value as Vector2;
		offsetFeather.y = value;

	}

	get color(): Color {

		return this.input.uniforms.get("color")!.value as Color;

	}

	set color(value: Color | number) {

		const color = this.input.uniforms.get("color")!.value as Color;
		color.set(value);

	}

}
