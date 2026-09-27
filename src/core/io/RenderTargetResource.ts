import { FloatType, HalfFloatType, RenderTargetOptions, WebGLRenderTarget } from "three";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";
import { Resolution } from "../../utils/Resolution.js";
import { Disposable } from "../Disposable.js";
import type { Output } from "./Output.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * A managed offscreen render target resource.
 *
 * @category IO
 */

export class RenderTargetResource extends Resource<Readonly<WebGLRenderTarget> | null> implements Disposable {

	// #region Backing Data

	/**
	 * @see {@link persistent}
	 */

	private _persistent: boolean;

	/**
	 * @see {@link owner}
	 */

	private _owner: Output | null;

	/**
	 * @see {@link autoSRGB}
	 */

	private _autoSRGB: boolean;

	// #endregion

	/**
	 * A collection of texture resources, organized by texture name.
	 *
	 * These resources reference the individual `textures` of the current render target.
	 */

	readonly textures: Map<string, TextureResource>;

	/**
	 * A resource that references the `texture` of the current render target.
	 */

	readonly texture: TextureResource;

	/**
	 * The render target descriptor.
	 *
	 * The materialized render target can be accessed through the resource {@link value}.
	 */

	readonly descriptor: RenderTargetDescriptor;

	/**
	 * The resolution of this render target.
	 *
	 * Defaults to the resolution of the associated pass.
	 */

	readonly resolution: Resolution;

	/**
	 * Constructs a new render target resource.
	 *
	 * @param options - Render target options.
	 */

	constructor(options?: RenderTargetOptions) {

		super(null);

		this._persistent = false;
		this._owner = null;
		this._autoSRGB = true;

		this.textures = new Map<string, TextureResource>();
		this.texture = new TextureResource();
		this.texture.setRenderTarget(this);

		this.resolution = new Resolution();
		this.descriptor = new RenderTargetDescriptor(options);
		this.descriptor.addEventListener("change", () => {

			this.updateTextureResources();
			this.setChanged();

		});

	}

	// #region Accessors

	override get value(): Readonly<WebGLRenderTarget> | null {

		return super.value;

	}

	/**
	 * Alias for {@link value}.
	 */

	get renderTarget(): Readonly<WebGLRenderTarget> | null {

		return this.value;

	}

	/**
	 * Indicates whether the primary frame buffer is capable of storing HDR values.
	 */

	get frameBufferPrecisionHigh(): boolean {

		const type = this.descriptor.options.type;
		return type === HalfFloatType || type === FloatType;

	}

	/**
	 * Controls automatic sRGB encoding for low precision output buffers.
	 *
	 * @defaultValue true
	 */

	get autoSRGB(): boolean {

		return this._autoSRGB;

	}

	set autoSRGB(value: boolean) {

		if(this._autoSRGB === value) {

			return;

		}

		this._autoSRGB = value;
		this.setChanged();

	}

	/**
	 * Persistent resources keep their allocation and contents across frames.
	 *
	 * @defaultValue false
	 */

	get persistent(): boolean {

		return this._persistent;

	}

	set persistent(value: boolean) {

		this._persistent = value;
		this.setChanged();

	}

	// #region Internal

	/**
	 * The current owner of this resource.
	 *
	 * @internal
	 */

	get owner(): Output | null {

		return this._owner;

	}

	set owner(value: Output | null) {

		this._owner = value;

	}

	// #endregion

	// #endregion

	/**
	 * Defines all possible textures that this resource provides.
	 *
	 * These texture resources will automatically be populated based on the current {@link renderTarget}.
	 */

	private updateTextureResources(): void {

		const textures = this.textures;
		const names = this.descriptor.textures.map(x => x.name);

		// Remove unused resources.
		for(const name of textures.keys()) {

			if(!names.includes(name)) {

				textures.delete(name);

			}

		}

		textures.set(names[0], this.texture);

		// Create new resources if they don't exist yet.
		for(let i = 1, l = names.length; i < l; ++i) {

			const name = names[i];

			if(!textures.has(name)) {

				const texture = new TextureResource();
				texture.setRenderTarget(this);
				textures.set(name, texture);

			}

		}

		this.updateTextureResourceValues();

	}

	/**
	 * Synchronizes the texture resources with the current render target.
	 */

	private updateTextureResourceValues(): void {

		this.texture.value = this.value?.texture ?? null;

		for(const textureResource of this.textures.values()) {

			textureResource.value = null;

		}

		if(this.value === null) {

			return;

		}

		for(const texture of this.value.textures) {

			const textureResource = this.textures.get(texture.name);

			if(textureResource !== undefined) {

				textureResource.value = texture;

			}

		}

	}

	dispose(): void {

		this.value?.dispose();

	}

	// #region Internal

	/**
	 * Sets the render target.
	 *
	 * @internal
	 * @param value - The render target.
	 */

	setRenderTarget(value: WebGLRenderTarget | null): void {

		super.value = value;
		this.updateTextureResourceValues();

	}

	// #endregion

}
