import {
	DepthFormat,
	DepthStencilFormat,
	FloatType,
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGBFormat,
	RGFormat,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt101111Type,
	UnsignedInt248Type
} from "three";

import { GBuffer } from "../../enums/GBuffer.js";
import { MSAASamples } from "../../enums/MSAASamples.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

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
	 *
	 * @remarks Changes to the type after the resource has been created will have no effect.
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

	readonly alpha: boolean;

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
		this.defineTextureTemplates();

	}

	// #region Settings

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

	// #endregion

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

}
