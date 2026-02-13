import { Uniform, Vector2 } from "three";
import { HalftoneShape } from "../enums/HalftoneShape.js";
import { ColorDodgeBlendFunction } from "./blending/blend-functions/ColorDodgeBlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/halftone.frag";

/**
 * HalftoneEffect options.
 *
 * @category Effects
 */

export interface HalftoneEffectOptions {

	/**
	 * The halftone shape.
	 *
	 * @defaultValue {@link HalftoneShape.DOT}
	 */

	shape?: HalftoneShape;

	/**
	 * The pattern radius.
	 *
	 * @defaultValue 6.0
	 */

	radius?: number;

	/**
	 * The grid rotation in radians.
	 *
	 * @defaultValue 0.7513
	 */

	rotation?: number;

	/**
	 * The sample count.
	 *
	 * @defaultValue 6
	 */

	samples?: number;

	/**
	 * A threshold bias.
	 *
	 * @defaultValue 0.0
	 */

	bias?: number;

	/**
	 * Whether the halftone pattern should be premultiplied with the input color.
	 *
	 * @defaultValue true
	 */

	premultiply?: boolean;

	/**
	 * Whether the halftone thresholding should be inverted.
	 *
	 * @defaultValue false
	 */

	inverted?: boolean;

}

/**
 * A halftone effect.
 *
 * @category Effects
 * @see https://github.com/mrange/shader-advent-2024/blob/main/day-22/README.md
 */

export class HalftoneEffect extends Effect implements HalftoneEffectOptions {

	/**
	 * @see {@link radius}
	 */

	private _radius: number;

	/**
	 * @see {@link rotation}
	 */

	private _rotation: number;

	/**
	 * Constructs a new halftone effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		shape = HalftoneShape.DOT,
		radius = 6.0,
		rotation = 0.7513,
		samples = 6,
		bias = 0.0,
		premultiply = false,
		inverted = false
	}: HalftoneEffectOptions = {}) {

		super("HalftoneEffect");

		this.fragmentShader = fragmentShader;
		this.blendMode.blendFunction = new ColorDodgeBlendFunction();

		const uniforms = this.input.uniforms;
		uniforms.set("invRadius", new Uniform(1.0));
		uniforms.set("rotation", new Uniform(new Vector2()));
		uniforms.set("bias", new Uniform(bias));

		this._radius = radius;
		this._rotation = rotation;

		this.shape = shape;
		this.rotation = rotation;
		this.samples = samples;
		this.premultiply = premultiply;
		this.inverted = inverted;

	}

	get shape() {

		return this.input.defines.get("SHAPE") as number;

	}

	set shape(value: HalftoneShape) {

		this.input.defines.set("SHAPE", value);
		this.setChanged();

	}

	get samples(): number {

		return this.input.defines.get("SAMPLES") as number;

	}

	set samples(value: number) {

		value = Math.max(value, 1);

		this.input.defines.set("SAMPLES", value);
		this.input.defines.set("INV_SAMPLES", (1.0 / value).toFixed(9));
		this.input.defines.set("INV_SAMPLES_SQ", (1.0 / (value * value)).toFixed(9));
		this.setChanged();

	}

	get radius() {

		return this._radius;

	}

	set radius(value: number) {

		this._radius = value;
		this.onResolutionChange();

	}

	get rotation() {

		return this._rotation;

	}

	set rotation(value: number) {

		const rotation = this.input.uniforms.get("rotation")!.value as Vector2;
		rotation.set(Math.sin(value), Math.cos(value));
		this._rotation = value;

	}

	get bias() {

		return this.input.uniforms.get("bias")!.value as number;

	}

	set bias(value: number) {

		this.input.uniforms.get("bias")!.value = value;

	}

	get premultiply(): boolean {

		return this.input.defines.has("PREMULTIPLY");

	}

	set premultiply(value: boolean) {

		if(this.premultiply !== value) {

			if(value) {

				this.input.defines.set("PREMULTIPLY", true);

			} else {

				this.input.defines.delete("PREMULTIPLY");

			}

			this.setChanged();

		}

	}

	get inverted(): boolean {

		return this.input.defines.has("INVERTED");

	}

	set inverted(value: boolean) {

		if(this.inverted !== value) {

			if(value) {

				this.input.defines.set("INVERTED", true);

			} else {

				this.input.defines.delete("INVERTED");

			}

			this.setChanged();

		}

	}

	protected override onResolutionChange(): void {

		const r = this.radius * this.resolution.scaledPixelRatio;
		this.input.uniforms.get("invRadius")!.value = 1.0 / Math.max(r, 1e-9);

	}

}
