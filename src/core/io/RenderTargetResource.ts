import { WebGLRenderTarget } from "three";
import { Resolution } from "../Resolution.js";
import { RenderTargetDescriptor, RenderTargetDescriptorOptions } from "./RenderTargetDescriptor.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * A managed offscreen render target resource.
 *
 * @category IO
 */

export class RenderTargetResource extends Resource<Readonly<WebGLRenderTarget> | null> {

	// #region Backing Data

	/**
	 * @see {@link persistent}
	 */

	private _persistent: boolean;

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

	constructor(options?: RenderTargetDescriptorOptions) {

		super(null);

		this._persistent = false;

		this.textures = new Map<string, TextureResource>();
		this.texture = new TextureResource();
		this.texture.setRenderTarget(this);

		this.resolution = new Resolution();
		this.descriptor = new RenderTargetDescriptor(options);
		this.descriptor.addEventListener("change", () => {

			this.updateTextureResources();
			this.setChanged();

		});

		this.updateTextureResources();

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

	// #endregion

	/**
	 * Defines __all__ textures that this render target resource can produce.
	 *
	 * These texture resources will automatically be populated based on the current {@link renderTarget}.
	 */

	private updateTextureResources(): void {

		const textures = this.textures;
		const names: string[] = [];

		for(let i = 0, l = this.descriptor.textures.length; i < l; ++i) {

			const textureTemplate = this.descriptor.textures[i];

			if(textureTemplate.name === undefined) {

				// Unnamed templates are unaddressable, skip.
				continue;

			}

			names.push(textureTemplate.name);

			if(i === 0) {

				textures.set(textureTemplate.name, this.texture);
				continue;

			}

			// Create new resources if they don't exist yet.
			if(!textures.has(textureTemplate.name)) {

				const texture = new TextureResource();
				texture.setRenderTarget(this);
				textures.set(textureTemplate.name, texture);

			}

		}

		// Remove unused resources.
		for(const name of textures.keys()) {

			if(!names.includes(name)) {

				textures.delete(name);

			}

		}

		this.updateTextureResourceValues();

	}

	/**
	 * Synchronizes the texture resources with the current render target.
	 */

	private updateTextureResourceValues(): void {

		this.texture.value = null;

		for(const textureResource of this.textures.values()) {

			textureResource.value = null;

		}

		if(this.renderTarget === null) {

			return;

		}

		// The primary texture resource is always considered active.
		this.texture.value = this.renderTarget.texture;

		for(const texture of this.renderTarget.textures) {

			const textureResource = this.textures.get(texture.name);

			if(textureResource !== undefined) {

				textureResource.value = texture;

			}

		}

		if(this.renderTarget.depthTexture !== null) {

			const textureResource = this.textures.get(this.renderTarget.depthTexture.name);

			if(textureResource !== undefined) {

				textureResource.value = this.renderTarget.depthTexture;

			}

		}

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
