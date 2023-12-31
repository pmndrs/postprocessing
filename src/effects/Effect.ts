import { ColorSpace, NoColorSpace } from "three";
import { Pass } from "../core/Pass.js";
import { SrcBlendFunction } from "./blending/blend-functions/SrcBlendFunction.js";
import { BlendMode } from "./blending/BlendMode.js";

/**
 * An abstract effect.
 *
 * Effects are subpasses that can be merged using the {@link EffectPass}.
 *
 * @group Effects
 */

export abstract class Effect extends Pass {

	/**
	 * The blend mode.
	 */

	readonly blendMode: BlendMode;

	/**
	 * @see {@link fragmentShader}
	 */

	private _fragmentShader: string | null;

	/**
	 * @see {@link vertexShader}
	 */

	private _vertexShader: string | null;

	/**
	 * @see {@link inputColorSpace}
	 */

	private _inputColorSpace: ColorSpace;

	/**
	 * @see {@link outputColorSpace}
	 */

	private _outputColorSpace: ColorSpace;

	/**
	 * Constructs a new effect.
	 *
	 * @param name - A name that will be used for debugging purposes. Doesn't have to be unique.
	 */

	constructor(name: string) {

		super(name);

		this.blendMode = new BlendMode(new SrcBlendFunction());
		this.blendMode.addEventListener(Pass.EVENT_CHANGE, () => this.setChanged());

		this._fragmentShader = null;
		this._vertexShader = null;
		this._inputColorSpace = NoColorSpace;
		this._outputColorSpace = NoColorSpace;

	}

	/**
	 * The fragment shader.
	 */

	get fragmentShader(): string | null {

		return this._fragmentShader;

	}

	set fragmentShader(value: string | null) {

		this._fragmentShader = value;
		this.setChanged();

	}

	/**
	 * The fragment shader.
	 */

	get vertexShader(): string | null {

		return this._vertexShader;

	}

	set vertexShader(value: string | null) {

		this._vertexShader = value;
		this.setChanged();

	}

	/**
	 * The input color space. Default is `NoColorSpace`, meaning no change.
	 *
	 * Ensures that the input colors are in the specified color space, converting them if necessary.
	 */

	get inputColorSpace(): ColorSpace {

		return this._inputColorSpace;

	}

	set inputColorSpace(value: ColorSpace) {

		this._inputColorSpace = value;
		this.setChanged();

	}

	/**
	 * The output color space. Default is `NoColorSpace`, meaning no change.
	 *
	 * Should only be defined if this effect converts the input colors to a different color space.
	 */

	get outputColorSpace(): ColorSpace {

		return this._outputColorSpace;

	}

	set outputColorSpace(value: ColorSpace) {

		this._outputColorSpace = value;
		this.setChanged();

	}

	/**
	 * Indicates whether this effect defines a `mainImage` function in its fragment shader.
	 */

	get hasMainImageFunction(): boolean {

		const regExp = /vec4\s+mainImage\s*\(.*vec4\s+\w+,.*vec2\s+\w+,.*GData\s+\w+\)/;
		return this.fragmentShader !== null && regExp.test(this.fragmentShader);

	}

	/**
	 * Indicates whether this effect defines a `mainUv` function in its fragment shader.
	 */

	get hasMainUvFunction(): boolean {

		const regExp = /void\s+mainUv\s*\(.*inout\s+vec2\s+\w+\)/;
		return this.fragmentShader !== null && regExp.test(this.fragmentShader);

	}

	/**
	 * Indicates whether this effect defines a `mainSupport` function in its vertex shader.
	 */

	get hasMainSupportFunction(): boolean {

		const regExp = /void\s+mainSupport\s*\(.*\)/;
		return this.vertexShader !== null && regExp.test(this.vertexShader);

	}

	render(): void {}

}
