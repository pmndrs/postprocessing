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
import { GBufferSchema } from "../../utils/gbuffer/GBufferSchema.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { SetExtensions } from "../../utils/SetExtensions.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * GBufferResource constructor options.
 *
 * @category IO
 */

export interface GBufferResourceOptions {

	/**
	 * A G-Buffer configuration.
	 */

	gBufferSchema?: GBufferSchema;

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

	frameBufferType?: TextureDataType;

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

	readonly gBufferSchema: GBufferSchema;
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
	 * Constructs a new G-Buffer resource.
	 *
	 * @param options - The options.
	 */

	constructor({
		gBufferSchema = new GBufferSchema(),
		alpha = false,
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = HalfFloatType,
		samples = 0
	}: GBufferResourceOptions = {}) {

		super({
			type: frameBufferType,
			stencilBuffer,
			depthBuffer,
			samples,
			depthTexture: null,
			count: 1
		});

		this.gBufferSchema = gBufferSchema;
		this.alpha = alpha;

		this._textureIndices = new Map();

		const gBufferComponents = new ObservableSet<string>();
		this.components = gBufferComponents;

		this.defineTextureConfigs();

		// Update the render target descriptor when the G-Buffer schema changes.
		// Descriptor changes will also emit a change event from this resource.
		gBufferSchema.addEventListener("change", () => this.updateDescriptor());
		gBufferComponents.addEventListener("change", () => this.updateDescriptor());

	}

	get stencilBuffer(): boolean {

		return this.descriptor.stencilBuffer!;

	}

	get depthBuffer(): boolean {

		return this.descriptor.depthBuffer!;

	}

	get frameBufferType(): TextureDataType {

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

		return this.frameBufferType === HalfFloatType || this.frameBufferType === FloatType;

	}

	/**
	 * Defines all possible G-Buffer texture configs.
	 */

	private defineTextureConfigs(): void {

		const useSmallFloatFormat = (this.frameBufferPrecisionHigh && !this.alpha);

		const textureConfigs: [string, TextureParameters][] = [
			[GBuffer.COLOR, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				type: useSmallFloatFormat ? UnsignedInt101111Type : this.frameBufferType,
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
		];

		for(const entry of textureConfigs) {

			// Keep existing configs.
			if(!this.gBufferSchema.textureTemplates.has(entry[0])) {

				this.gBufferSchema.textureTemplates.set(entry[0], entry[1]);

			}

		}

		// Create a texture resource for each config.
		this.setTextures(textureConfigs.map(x => x[0]));

	}

	/**
	 * Updates the depth texture based on the current requirements.
	 */

	private configureDepthTexture(): void {

		const descriptor = this.descriptor;
		const textureConfig = this.gBufferSchema.textureTemplates.get(GBuffer.DEPTH);

		if(this.value === null || textureConfig === undefined) {

			return;

		}

		if(!this.components.has(GBuffer.DEPTH)) {

			descriptor.depthTexture = null;
			return;

		}

		const texture = new DepthTexture();
		texture.name = GBuffer.DEPTH;
		texture.setValues(textureConfig);
		descriptor.depthTexture = texture;

	}

	/**
	 * Updates the G-Buffer descriptor based on the required {@link components}.
	 */

	private updateDescriptor(): void {

		if(this.components.size === 0) {

			this.descriptor.textures.clear();
			return;

		}

		// Get the texture configs that correspond to the required G-Buffer components (depth is handled separately).
		const textureConfigs = Array.from(this.gBufferSchema.textureTemplates)
			.filter(x => this.components.has(x[0]) && x[0] !== GBuffer.DEPTH as string);

		const descriptor = this.descriptor;
		descriptor.count = textureConfigs.length;
		descriptor.textures.setAll(...textureConfigs);

		this._textureIndices.clear();

		for(let i = 0, l = textureConfigs.length; i < l; ++i) {

			const textureConfig = textureConfigs[i];
			const gBufferComponent = textureConfig[0];
			this._textureIndices.set(gBufferComponent, i);

		}

		this.configureDepthTexture();

	}

}
