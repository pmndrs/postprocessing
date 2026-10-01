import { DepthTexture, Event, EventDispatcher, RenderTargetOptions, TextureDataType, TextureParameters } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { textureParametersEqual } from "./functions/texture.js";
import { defaultRenderTargetOptions } from "./objects/defaultRenderTargetOptions.js";
import { TextureTemplate } from "../textures/TextureTemplate.js";
import { TextureParametersWithName } from "../textures/TextureParametersWithName.js";
import { MSAASamples } from "../enums/MSAASamples.js";

/**
 * RenderTargetDescriptor constructor options.
 */

export interface RenderTargetDescriptorOptions extends RenderTargetOptions {

	/**
	 * The name of the primary texture attachment.
	 */

	name?: string;

	/**
	 * Multiple named texture attachments.
	 *
	 * @remarks Mutually exclusive with {@link name}.
	 */

	textures?: readonly (TextureTemplate | TextureParametersWithName)[];

}

/**
 * A render target descriptor.
 *
 * @category Utils
 */

export class RenderTargetDescriptor extends EventDispatcher<BaseEventMap> {

	/**
	 * An event listener that dispatches a `change` event.
	 */

	private readonly propagateChangeEvent: (event: Event<"change">) => void;

	// #region Backing Data

	/**
	 * @see {@link options}
	 */

	private _options: RenderTargetOptions;

	/**
	 * @see {@link textures}
	 */

	private _textures: TextureTemplate[];

	// #endregion

	/**
	 * Constructs a new render target descriptor.
	 *
	 * @param options - Render target options.
	 */

	constructor(options?: RenderTargetDescriptorOptions) {

		super();

		this.propagateChangeEvent = (event) => this.dispatchEvent(event);

		// Destructure textures and name out before merging.
		const { textures, name, ...rest } = options ?? {};
		this._options = Object.assign({}, defaultRenderTargetOptions, rest);
		this._textures = [];

		if(textures !== undefined && textures.length > 0) {

			this.textures = textures;

		} else {

			this.textures = [new TextureTemplate(name, rest)];

		}

	}

	/**
	 * The render target options.
	 *
	 * Use the individual property setters (e.g. {@link samples}, {@link depthTexture}) or
	 * {@link texture} to modify these options.
	 */

	get options(): Readonly<RenderTargetOptions> {

		return this._options;

	}

	/**
	 * The primary texture attachment template.
	 */

	get texture(): TextureTemplate {

		return this.textures[0];

	}

	// #region Settings

	/**
	 * The texture attachment templates.
	 */

	get textures(): readonly TextureTemplate[] {

		return this._textures;

	}

	set textures(value: readonly (TextureTemplate | TextureParametersWithName)[]) {

		if(value.length === 0) {

			throw new Error("Expected at least one texture template");

		}

		for(const texture of this.textures) {

			texture.removeEventListener("change", this.propagateChangeEvent);

		}

		this._textures = value.map(t => {

			const template = t instanceof TextureTemplate ? t.clone() : new TextureTemplate(t.name, t);
			template.addEventListener("change", this.propagateChangeEvent);
			return template;

		});

		this.setChanged();

	}

	get stencilBuffer(): boolean | undefined {

		return this._options.stencilBuffer;

	}

	get depthBuffer(): boolean | undefined {

		return this._options.depthBuffer;

	}

	get type(): TextureDataType | undefined {

		return this.texture.values.type;

	}

	get samples(): MSAASamples | undefined {

		return this._options.samples as MSAASamples | undefined;

	}

	set samples(value: MSAASamples) {

		this._options.samples = value;
		this.setChanged();

	}

	get depthTexture(): DepthTexture | null | undefined {

		return this._options.depthTexture;

	}

	set depthTexture(value: DepthTexture | null) {

		this._options.depthTexture = value;
		this.setChanged();

	}

	// #endregion

	/**
	 * Dispatches a `change` event.
	 */

	private setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Creates a new descriptor that equals this one.
	 *
	 * @return The clone.
	 */

	clone(): RenderTargetDescriptor {

		return new RenderTargetDescriptor({ ...this.options, textures: this.textures });

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

		if(this.stencilBuffer !== other.stencilBuffer ||
			this.depthBuffer !== other.depthBuffer ||
			this.samples !== other.samples) {

			return false;

		}

		// Texture templates

		if(this.textures.length !== other.textures.length) {

			return false;

		}

		for(let i = 0, l = this.textures.length; i < l; ++i) {

			if(!this.textures[i].equals(other.textures[i])) {

				return false;

			}

		}

		// DepthTexture

		const depthTextureA = this.depthTexture ?? null;
		const depthTextureB = other.depthTexture ?? null;

		if(depthTextureA !== depthTextureB) {

			return false;

		}

		return textureParametersEqual(
			depthTextureA as TextureParameters,
			depthTextureB as TextureParameters
		);

	}

}
