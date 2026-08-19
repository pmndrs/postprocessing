import { RenderTargetOptions, WebGLRenderTarget } from "three";
import { MapExtensions } from "../../utils/MapExtensions.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";
import { Resolution } from "../../utils/Resolution.js";
import { Disposable } from "../Disposable.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * A managed offscreen render target resource.
 *
 * @category IO
 */

export class RenderTargetResource extends Resource<Readonly<WebGLRenderTarget> | null> implements Disposable {

	/**
	 * @see {@link textures}
	 */

	private readonly _textures: Map<string, TextureResource> & MapExtensions<string, TextureResource>;

	/**
	 * @see {@link persistent}
	 */

	private _persistent: boolean;

	/**
	 * The current render target descriptor.
	 *
	 * The materialized render target is made available through the resource's {@link value}.
	 */

	readonly descriptor: RenderTargetDescriptor;

	/**
	 * A resource that references the `texture` of the current render target, or `null` if {@link textures} is empty.
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

		this.texture = new TextureResource();
		this.texture.setRenderTarget(this);

		this.resolution = new Resolution();

		this.descriptor = new RenderTargetDescriptor(options);
		this.descriptor.addEventListener("change", () => this.setChanged());

	}

	override get value(): Readonly<WebGLRenderTarget> | null {

		return super.value;

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

	/**
	 * Defines texture resources as handles for the `textures` of the current render target.
	 *
	 * @param names - The names to use for creating the texture resources.
	 */

	protected setTextures(names: Iterable<string>): void {

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
	 * Alias for {@link value}.
	 */

	get renderTarget(): Readonly<WebGLRenderTarget> | null {

		return this.value;

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

	dispose(): void {

		this.value?.dispose();

	}

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

}
