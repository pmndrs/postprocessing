import {
	DepthTexture,
	FloatType,
	HalfFloatType,
	RenderTargetOptions,
	TextureParameters,
	WebGLRenderTarget
} from "three";

import { GBuffer } from "../../enums/GBuffer.js";
import { MapExtensions } from "../../utils/MapExtensions.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";
import { Resolution } from "../../utils/Resolution.js";
import { SetExtensions } from "../../utils/SetExtensions.js";
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
	 * @see {@link textures}
	 */

	private readonly _textures: Map<string, TextureResource> & MapExtensions<string, TextureResource>;

	/**
	 * @see {@link persistent}
	 */

	private _persistent: boolean;

	/**
	 * @see {@link owner}
	 */

	private _owner: Output | null;

	/**
	 * @see {@link aliasOf}
	 */

	private _aliasOf: RenderTargetResource | null;

	// #endregion

	/**
	 * A collection of texture configurations, organized by name.
	 */

	protected readonly textureTemplates: Map<string, TextureParameters> & MapExtensions<string, TextureParameters>;

	/**
	 * A collection of textures that are currently connected to other passes.
	 *
	 * @see {@link GBuffer} for built-in textures.
	 * @internal
	 */

	readonly activeTextures: Set<string> & SetExtensions<string>;

	/**
	 * The current render target descriptor.
	 *
	 * The materialized render target can be accessed through the resource {@link value}.
	 */

	readonly descriptor: RenderTargetDescriptor;

	/**
	 * A resource that references the `texture` of the current render target.
	 */

	readonly texture: TextureResource;

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

		const textures = new ObservableMap<string, TextureResource>();
		textures.addEventListener("change", () => this.updateTextureResources());
		this._textures = textures;
		this._persistent = false;
		this._owner = null;
		this._aliasOf = null;

		this.texture = new TextureResource();
		this.texture.setRenderTarget(this);

		this.descriptor = new RenderTargetDescriptor(options);
		this.descriptor.addEventListener("change", () => this.setChanged());

		const textureTemplates = new ObservableMap<string, TextureParameters>();
		textureTemplates.addEventListener("change", () => {

			this.setTextureResources(this.textureTemplates.keys());
			this.updateDescriptor();

		});

		this.textureTemplates = textureTemplates;

		const activeTextures = new ObservableSet<string>();
		activeTextures.addEventListener("change", () => this.updateDescriptor());
		this.activeTextures = activeTextures;

		this.resolution = new Resolution();

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

		return this.descriptor.type === HalfFloatType || this.descriptor.type === FloatType;

	}

	/**
	 * A collection of texture resources, organized by texture name.
	 *
	 * These resources reference the individual `textures` of the current render target.
	 */

	get textures(): ReadonlyMap<string, TextureResource> {

		return this._textures;

	}

	/**
	 * Persistent resources keep their allocation and contents across frames and are excluded from pooling.
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

	/**
	 * The resource that this resource aliases.
	 *
	 * @internal
	 */

	get aliasOf(): RenderTargetResource | null {

		return this._aliasOf;

	}

	/**
	 * Identifies the materialized render target.
	 *
	 * @internal
	 */

	get storageId(): number {

		return this._aliasOf?.storageId ?? this.id;

	}

	// #endregion

	// #endregion

	/**
	 * Defines all possible textures that this resource can provide.
	 *
	 * These texture resources will automatically be populated based on the current render target.
	 *
	 * @param names - The names of the texture resources.
	 */

	private setTextureResources(names: Iterable<string>): void {

		const textures = new Map<string, TextureResource>();

		for(const name of names) {

			if(this._textures.has(name)) {

				textures.set(name, this._textures.get(name)!);
				continue;

			}

			const texture = new TextureResource();
			texture.setRenderTarget(this);
			textures.set(name, texture);

		}

		this._textures.clear();
		this._textures.setAll(...textures);

	}

	/**
	 * Synchronizes the texture resources with the current render target.
	 */

	private updateTextureResources(): void {

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

	/**
	 * Updates the depth texture based on the current requirements.
	 */

	private configureDepthTexture(): void {

		const descriptor = this.descriptor;
		const textureTemplate = this.textureTemplates.get(GBuffer.DEPTH);

		if(textureTemplate === undefined || !this.activeTextures.has(GBuffer.DEPTH)) {

			descriptor.depthTexture = null;
			return;

		}

		const texture = new DepthTexture();
		texture.name = GBuffer.DEPTH;
		texture.setValues(textureTemplate);
		descriptor.depthTexture = texture;

	}

	/**
	 * Updates the descriptor based on the {@link activeTextures}.
	 */

	private updateDescriptor(): void {

		// Get the templates for the required textures (depth is handled separately).
		const textureTemplates = Array.from(this.textureTemplates)
			.filter(x => this.activeTextures.has(x[0]) && x[0] !== GBuffer.DEPTH as string);

		const descriptor = this.descriptor;
		descriptor.count = textureTemplates.length;
		descriptor.textures.clear();
		descriptor.textures.setAll(...textureTemplates);

		this.configureDepthTexture();

	}

	/**
	 * Makes this resource an alias of the given resource.
	 *
	 * @throws If the given resource is this resource.
	 * @param resource - The resource to alias. Set to `null` to undo the alias.
	 */

	alias(resource: RenderTargetResource | null): void {

		if(resource === this) {

			throw new Error("A render target resource cannot alias itself");

		}

		this._aliasOf = resource;
		this.setChanged();

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
		this.updateTextureResources();

	}

	// #endregion

}
