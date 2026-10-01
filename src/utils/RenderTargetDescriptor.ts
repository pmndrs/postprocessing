import { EventDispatcher, RenderTargetOptions, TextureParameters } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { textureParametersEqual } from "./functions/texture.js";
import { defaultRenderTargetOptions } from "./objects/defaultRenderTargetOptions.js";
import { TextureTemplate } from "./TextureTemplate.js";

/**
 * RenderTargetDescriptor constructor options.
 */

export interface RenderTargetDescriptorOptions extends RenderTargetOptions {

	/**
	 * Texture attachment templates.
	 */

	textures?: TextureTemplate[];

}

/**
 * A render target descriptor.
 *
 * @category Utils
 */

export class RenderTargetDescriptor extends EventDispatcher<BaseEventMap> {

	// #region Backing Data

	/**
	 * @see {@link options}
	 */

	private _values: RenderTargetDescriptorOptions;

	// #endregion

	/**
	 * Constructs a new render target descriptor.
	 *
	 * @param options - Render target options.
	 */

	constructor(options?: RenderTargetDescriptorOptions) {

		super();

		this._values = Object.assign({}, defaultRenderTargetOptions, options);
		const values = this._values;

		this.textures = (values.textures === undefined || values.textures.length === 0) ? [values] : values.textures;

	}

	/**
	 * The render target options.
	 *
	 * @see {@link setValues} for changing these options.
	 */

	get options(): Readonly<RenderTargetOptions> {

		return this._values;

	}

	/**
	 * The texture attachment templates.
	 */

	get textures(): readonly Readonly<TextureTemplate>[] {

		return this._values.textures!;

	}

	set textures(value: TextureTemplate[]) {

		if(value.length === 0) {

			throw new Error("Expected at least one texture template");

		}

		// Clone the templates to prevent external mutation.
		this._values.textures = value.map(x => Object.assign({}, x));
		this.setChanged();

	}

	/**
	 * The primary texture attachment template.
	 */

	get texture(): Readonly<TextureTemplate> {

		return this._values.textures![0];

	}

	/**
	 * The name of the main {@link textures|texture attachment} at index 0.
	 */

	get name(): string | undefined {

		return this._values.textures![0].name;

	}

	set name(value: string) {

		this._values.textures![0].name = value;
		this.setChanged();

	}

	/**
	 * Dispatches a `change` event.
	 */

	private setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Sets the given render target options.
	 *
	 * Unrelated options will be retained.
	 *
	 * @param values - The values to apply.
	 */

	setValues(values: RenderTargetOptions): void {

		let changed = false;

		for(const key of Object.keys(values) as (keyof RenderTargetOptions)[]) {

			if(values[key] !== this._values[key]) {

				changed = true;
				break;

			}

		}

		if(changed) {

			Object.assign(this._values, values);
			this.setChanged();

		}

	}

	/**
	 * Creates a new descriptor that equals this one.
	 *
	 * @return The clone.
	 */

	clone(): RenderTargetDescriptor {

		return new RenderTargetDescriptor(this.options);

	}

	/**
	 * Compares a given descriptor with this one.
	 *
	 * @param other - A descriptor.
	 * @return True if the descriptors are equal.
	 */

	equals(other: RenderTargetDescriptor): boolean {

		// Identity

		if(this === other) {

			return true;

		}

		// RenderTarget options

		for(const key of Object.keys(this.options) as (keyof RenderTargetOptions)[]) {

			if(this.options[key] !== other.options[key]) {

				return false;

			}

		}

		// Texture templates

		if(!textureParametersEqual(this.texture, other.texture)) {

			return false;

		}

		if(this.textures.length !== other.textures.length) {

			return false;

		}

		for(let i = 0, l = this.textures.length; i < l; ++i) {

			if(!textureParametersEqual(this.textures[i], other.textures[i])) {

				return false;

			}

		}

		// DepthTexture

		const depthTextureA = this.options.depthTexture ?? null;
		const depthTextureB = other.options.depthTexture ?? null;

		if(depthTextureA !== depthTextureB || depthTextureA === null || depthTextureB === null) {

			return false;

		}

		return textureParametersEqual(depthTextureA as TextureParameters, depthTextureB as TextureParameters);

	}

}
