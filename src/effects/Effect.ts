import { ColorSpace, NoColorSpace } from "three";
import { Pass } from "../core/Pass.js";
import { GData } from "../enums/GData.js";
import { SrcBlendFunction } from "./blending/blend-functions/SrcBlendFunction.js";
import { BlendMode } from "./blending/BlendMode.js";

/**
 * An abstract effect.
 *
 * Effects are subpasses that can be merged using the {@link EffectPass}.
 *
 * @category Effects
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
	 * A collection of required GBuffer data.
	 *
	 * This data depends on the current fragment shader and will be updated automatically.
	 *
	 * @internal
	 */

	readonly gData: Set<GData | string>;

	/**
	 * A hint that indicates whether this effect will be toggled at runtime.
	 *
	 * Toggling an effect will also set this flag to `true`.
	 *
	 * @defaultValue false
	 */

	optional: boolean;

	/**
	 * Constructs a new effect.
	 *
	 * @param name - A name that will be used for debugging purposes.
	 */

	constructor(name: string) {

		super(name);

		this.blendMode = new BlendMode(new SrcBlendFunction());
		this.blendMode.addEventListener("change", () => this.setChanged());
		this.input.addEventListener("change", () => this.detectGDataUsage());

		this._fragmentShader = null;
		this._vertexShader = null;
		this._inputColorSpace = NoColorSpace;
		this._outputColorSpace = NoColorSpace;

		this.gData = new Set();
		this.optional = false;

	}

	override get enabled(): boolean {

		return super.enabled;

	}

	override set enabled(value: boolean) {

		if(super.enabled !== value) {

			this.optional = true;

		}

		super.enabled = value;

	}

	/**
	 * The fragment shader.
	 */

	get fragmentShader(): string | null {

		return this._fragmentShader;

	}

	set fragmentShader(value: string | null) {

		this._fragmentShader = value;
		this.detectGDataUsage();
		this.setChanged();

	}

	/**
	 * The vertex shader.
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

		if(this.fragmentShader === null) {

			return false;

		}

		const regExp = /vec4\s+mainImage\s*\([a-z\s]*vec4\s+\w+,[a-z\s]*vec2\s+\w+,[a-z\s]*GData\s+\w+\)/;
		return regExp.test(this.fragmentShader);

	}

	/**
	 * Indicates whether this effect defines a `mainUv` function in its fragment shader.
	 */

	get hasMainUvFunction(): boolean {

		if(this.fragmentShader === null) {

			return false;

		}

		const regExp = /void\s+mainUv\s*\(\s*inout\s+vec2\s+\w+\)/;
		return regExp.test(this.fragmentShader);

	}

	/**
	 * Indicates whether this effect defines a `mainSupport` function in its vertex shader.
	 */

	get hasMainSupportFunction(): boolean {

		if(this.vertexShader === null) {

			return false;

		}

		const regExp = /void\s+mainSupport\s*\([a-z\s]*vec2\s+\w+\)/;
		return regExp.test(this.vertexShader);

	}

	/**
	 * Checks the fragment shader for `GData` usage.
	 */

	private detectGDataUsage(): void {

		this.gData.clear();

		if(this.input.gBufferConfig === null || !this.hasMainImageFunction) {

			return;

		}

		const shader = this.fragmentShader!;
		const gBufferConfig = this.input.gBufferConfig;
		const gDataParamName = /GData\s+(\w+)/.exec(shader)![1];

		for(const value of Object.values(GData)) {

			if(!shader.includes(`${gDataParamName}.${value}`)) {

				continue;

			}

			for(const dependency of gBufferConfig.gDataDependencies.get(value) ?? []) {

				this.gData.add(dependency);

			}

			this.gData.add(value);

		}

		for(const gData of this.gData) {

			for(const component of gBufferConfig.gDataBufferSources.get(gData) ?? []) {

				if(!this.input.gBuffer.has(component)) {

					this.input.gBuffer.add(component);
					console.warn(`${this.name} uses ${gData} but does not declare input G-Buffer component ${component}`);

				}

			}

		}

	}

	/**
	 * Validates this effect.
	 *
	 * @throws If the effect is invalid.
	 */

	validate(): void {

		const fragmentShader = this.fragmentShader;

		if(fragmentShader === null) {

			throw new Error(`Missing fragment shader (${this.name})`);

		}

		if(!this.hasMainImageFunction && !this.hasMainUvFunction) {

			throw new Error(`Could not find a valid mainImage or mainUv function (${this.name})`);

		}

	}

	override render(): void {}

}
