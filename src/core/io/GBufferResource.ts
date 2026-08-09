import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGBFormat,
	RGFormat,
	TextureDataType,
	TextureParameters,
	UnsignedByteType,
	UnsignedInt101111Type,
	UnsignedInt248Type
} from "three";

import { GBuffer } from "../../enums/GBuffer.js";
import { MSAASamples } from "../../enums/MSAASamples.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { SetExtensions } from "../../utils/SetExtensions.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { MapExtensions } from "../../utils/MapExtensions.js";

/**
 * GBufferResource constructor options.
 *
 * @category IO
 */

export interface GBufferResourceOptions {

	/**
	 * Controls whether color buffers should use an alpha channel.
	 *
	 * Disabling alpha enables small internal float formats for reduced memory consumption.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Small_Float_Formats
	 * @defaultValue false
	 */

	alpha?: boolean;

	/**
	 * Determines whether a stencil buffer should be created.
	 *
	 * @defaultValue false
	 */

	stencilBuffer?: boolean;

	/**
	 * Determines whether a depth buffer should be created.
	 *
	 * @defaultValue true
	 */

	depthBuffer?: boolean;

	/**
	 * The texture data type used for color buffers.
	 *
	 * Disabling {@link alpha} enables small internal float formats for reduced memory consumption.
	 * Changes to the type after the resource has been created will have no effect.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Small_Float_Formats
	 * @defaultValue HalfFloatType
	 */

	type?: TextureDataType;

	/**
	 * The amount of samples used for MSAA.
	 *
	 * @defaultValue 0
	 */

	samples?: MSAASamples;

}

/**
 * A G-Buffer resource wrapper.
 *
 * @category IO
 */

export class GBufferResource extends RenderTargetResource implements GBufferResourceOptions {

	// #region Settings

	readonly alpha: boolean;

	// #endregion

	/**
	 * @see {@link textureIndices}
	 */

	private readonly _textureIndices: Map<string, number>;

	/**
	 * A collection of G-Buffer components that are required for rendering.
	 *
	 * @see {@link GBuffer} for built-in components.
	 * @internal
	 */

	readonly components: Set<string> & SetExtensions<string>;

	/**
	 * A collection that maps G-Buffer components to G-Buffer texture configurations.
	 */

	readonly textureTemplates: Map<string, TextureParameters> & MapExtensions<string, TextureParameters>;

	/**
	 * Constructs a new G-Buffer resource.
	 *
	 * @param options - The options.
	 */

	constructor({
		alpha = false,
		stencilBuffer = false,
		depthBuffer = true,
		type = HalfFloatType,
		samples = 0
	}: GBufferResourceOptions = {}) {

		super({
			type,
			stencilBuffer,
			depthBuffer,
			samples,
			depthTexture: null,
			count: 1
		});

		this.alpha = alpha;
		this._textureIndices = new Map();

		const gBufferComponents = new ObservableSet<string>();
		gBufferComponents.addEventListener("change", () => this.updateDescriptor());
		this.components = gBufferComponents;

		const textureTemplates = new ObservableMap<GBuffer | string, TextureParameters>();
		textureTemplates.addEventListener("change", () => {

			this.setTextures(this.textureTemplates.keys());
			this.updateDescriptor();

		});

		this.textureTemplates = textureTemplates;
		this.defineTextureTemplates();

	}

	get stencilBuffer(): boolean {

		return this.descriptor.stencilBuffer!;

	}

	get depthBuffer(): boolean {

		return this.descriptor.depthBuffer!;

	}

	get type(): TextureDataType {

		return this.descriptor.type!;

	}

	get samples(): MSAASamples {

		return this.descriptor.samples as MSAASamples;

	}

	set samples(value: MSAASamples) {

		this.descriptor.samples = value;

	}

	/**
	 * G-Buffer texture indices organized by G-Buffer components.
	 *
	 * @internal
	 */

	get textureIndices(): ReadonlyMap<string, number> {

		return this._textureIndices;

	}

	/**
	 * Indicates whether the primary frame buffer is capable of storing HDR values.
	 */

	private get frameBufferPrecisionHigh(): boolean {

		return this.type === HalfFloatType || this.type === FloatType;

	}

	/**
	 * Defines all built-in G-Buffer texture templates.
	 */

	private defineTextureTemplates(): void {

		const useSmallFloatFormat = (this.frameBufferPrecisionHigh && !this.alpha);

		this.textureTemplates.setAll(
			[GBuffer.COLOR, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				type: useSmallFloatFormat ? UnsignedInt101111Type : this.type,
				format: useSmallFloatFormat ? RGBFormat : RGBAFormat
			}],
			[GBuffer.DEPTH, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: this.stencilBuffer ? UnsignedInt248Type : FloatType,
				format: this.stencilBuffer ? DepthStencilFormat : DepthFormat
			}],
			[GBuffer.NORMAL, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: HalfFloatType,
				format: RGFormat
			}],
			[GBuffer.ORM, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				type: UnsignedByteType,
				format: RGBAFormat
			}],
			[GBuffer.EMISSION, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				type: HalfFloatType,
				format: RGBAFormat
				// R11F_G11F_B10F causes random artifacts (possibly a driver bug)
				// type: UnsignedInt101111Type,
				// format: RGBFormat,
				// internalFormat: "R11F_G11F_B10F"
			}]
		);

	}

	/**
	 * Updates the depth texture based on the current requirements.
	 */

	private configureDepthTexture(): void {

		const descriptor = this.descriptor;
		const textureTemplate = this.textureTemplates.get(GBuffer.DEPTH);

		if(textureTemplate === undefined || !this.components.has(GBuffer.DEPTH)) {

			descriptor.depthTexture = null;
			return;

		}

		const texture = new DepthTexture();
		texture.name = GBuffer.DEPTH;
		texture.setValues(textureTemplate);
		descriptor.depthTexture = texture;

	}

	/**
	 * Updates the G-Buffer descriptor based on the required {@link components}.
	 */

	private updateDescriptor(): void {

		// Get the templates for the required G-Buffer components (depth is handled separately).
		const textureTemplates = Array.from(this.textureTemplates)
			.filter(x => this.components.has(x[0]) && x[0] !== GBuffer.DEPTH as string);

		const descriptor = this.descriptor;
		descriptor.count = textureTemplates.length;
		descriptor.textures.clear();
		descriptor.textures.setAll(...textureTemplates);

		this._textureIndices.clear();

		for(let i = 0, l = textureTemplates.length; i < l; ++i) {

			// gBufferComponent => index
			this._textureIndices.set(textureTemplates[i][0], i);

		}

		this.configureDepthTexture();

	}

}
