import { EventDispatcher, RenderTargetOptions } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { defaultRenderTargetOptions } from "./objects/defaultRenderTargetOptions.js";
import { TextureTemplate } from "./TextureTemplate.js";
import { GBuffer } from "../enums/GBuffer.js";

/**
 * RenderTargetDescriptor constructor options.
 */

export interface RenderTargetDescriptorOptions extends RenderTargetOptions {

	/**
	 * The name of the main texture attachment.
	 */

	name?: string;

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

		const values = Object.assign({}, defaultRenderTargetOptions, options);
		this._values = values;

		if(values.textures === undefined || values.textures.length === 0) {

			const textureTemplate = values as TextureTemplate;
			textureTemplate.name ??= GBuffer.COLOR;
			values.textures = [textureTemplate];

		} else {

			// Clone the individual templates.
			values.textures = values.textures.map(x => Object.assign({}, x));

		}

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

		this._values.textures = value;
		this.setChanged();

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

}
