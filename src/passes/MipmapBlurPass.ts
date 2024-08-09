import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { DownsamplingMaterial, DownsamplingMaterialOptions } from "../materials/DownsamplingMaterial.js";
import { UpsamplingMaterial, UpsamplingMaterialOptions } from "../materials/UpsamplingMaterial.js";

/**
 * MipmapBlurPass constructor options.
 *
 * @category Passes
 */

export interface MipmapBlurPassOptions extends DownsamplingMaterialOptions, UpsamplingMaterialOptions {

	/**
	 * The amount of MIP levels.
	 *
	 * At 720p 8 steps are likely too much, while at 4K a they might not be enough.
	 *
	 * @defaultValue 8
	 */

	levels?: number;

	/**
	 * Controls whether the image should be scaled up to the original resolution.
	 *
	 * If disabled, the upsampling process will stop at half resolution.
	 *
	 * @defaultValue false
	 */

	fullResolutionUpsampling?: boolean;

}

/**
 * A blur pass that produces a wide blur by downsampling and upsampling the input over multiple MIP levels.
 *
 * Based on an article by Fabrice Piquet.
 *
 * @see https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 * @category Passes
 */

export class MipmapBlurPass extends Pass<DownsamplingMaterial | UpsamplingMaterial> {

	/**
	 * Identifies the main output buffer.
	 */

	private static readonly BUFFER_MAIN = "BUFFER_MAIN";

	/**
	 * The mipmaps used for downsampling.
	 */

	private downsamplingMipmaps: RenderTargetResource[];

	/**
	 * The mipmaps used for upsampling.
	 */

	private upsamplingMipmaps: RenderTargetResource[];

	/**
	 * A downsampling material.
	 */

	private downsamplingMaterial: DownsamplingMaterial;

	/**
	 * An upsampling material.
	*/

	private upsamplingMaterial: UpsamplingMaterial;

	/**
	 * @see {@link fullResolutionUpsampling}
	*/

	private _fullResolutionUpsampling: boolean;

	/**
	 * Constructs a new mipmap blur pass.
	 *
	 * @param options - The options.
	 */

	constructor({ levels = 8, radius, fullResolutionUpsampling = false, clampToBorder }: MipmapBlurPassOptions = {}) {

		super("MipmapBlurPass");

		const renderTarget = this.createFramebuffer();
		renderTarget.texture.name = MipmapBlurPass.BUFFER_MAIN;
		this.output.setBuffer(MipmapBlurPass.BUFFER_MAIN, renderTarget);

		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];

		this.downsamplingMaterial = new DownsamplingMaterial({ clampToBorder });
		this.upsamplingMaterial = new UpsamplingMaterial({ radius });

		this.disposables.add(this.downsamplingMaterial);
		this.disposables.add(this.upsamplingMaterial);

		this._fullResolutionUpsampling = fullResolutionUpsampling;
		this.levels = levels;

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(MipmapBlurPass.BUFFER_MAIN)!.texture;

	}

	/**
	 * The MIP levels.
	 *
	 * @throws If the number of levels is lower than 0.
	 * @defaultValue 8
	 */

	get levels(): number {

		return this.downsamplingMipmaps.length;

	}

	set levels(value: number) {

		if(value <= 0) {

			throw new Error("The level count must be greater than 0");

		}

		if(this.levels !== value) {

			this.createMipmaps(value);

		}

	}

	/**
	 * The blur radius.
	 *
	 * @defaultValue 0.85
	 */

	get radius(): number {

		return this.upsamplingMaterial.radius;

	}

	set radius(value: number) {

		this.upsamplingMaterial.radius = value;

	}

	/**
	 * Controls whether the image should be scaled up to the original resolution.
	 *
	 * If disabled, the upsampling process will stop at half resolution.
	 *
	 * @defaultValue false
	 */

	get fullResolutionUpsampling(): boolean {

		return this._fullResolutionUpsampling;

	}

	set fullResolutionUpsampling(value: boolean) {

		if(this._fullResolutionUpsampling !== value) {

			this._fullResolutionUpsampling = value;
			this.createMipmaps(this.levels);

		}

	}

	/**
	 * Updates the mipmap render targets.
	 *
	 * @param levels - The mipmap level count.
	 */

	private createMipmaps(levels: number): void {

		const output = this.output;
		const mainBufferResource = output.buffers.get(MipmapBlurPass.BUFFER_MAIN)!;
		const renderTarget = mainBufferResource.value!;

		this.dispose();
		this.disposables.clear();
		this.disposables.add(this.downsamplingMaterial);
		this.disposables.add(this.upsamplingMaterial);

		output.buffers.clear();

		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];

		if(levels === 1 && !this.fullResolutionUpsampling) {

			// Only need one render target for downsampling.
			output.setBuffer(MipmapBlurPass.BUFFER_MAIN, mainBufferResource);
			this.downsamplingMipmaps.push(mainBufferResource);

			return;

		}

		for(let i = 0; i < levels; ++i) {

			const mipmap = renderTarget.clone();
			mipmap.texture.name = "DOWNSAMPLING_MIPMAP" + i;
			const mipmapResource = new RenderTargetResource(mipmap);
			output.setBuffer(mipmap.texture.name, mipmapResource);
			this.downsamplingMipmaps.push(mipmapResource);

		}

		output.setBuffer(MipmapBlurPass.BUFFER_MAIN, mainBufferResource);
		this.upsamplingMipmaps.push(mainBufferResource);

		for(let i = 1, l = this.fullResolutionUpsampling ? levels : levels - 1; i < l; ++i) {

			const mipmap = renderTarget.clone();
			mipmap.texture.name = "UPSAMPLING_MIPMAP" + i;
			const mipmapResource = new RenderTargetResource(mipmap);
			output.setBuffer(mipmap.texture.name, mipmapResource);
			this.upsamplingMipmaps.push(mipmapResource);

		}

		this.onResolutionChange();

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const { type, colorSpace } = this.input.defaultBuffer.value;

		for(const mipmap of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) {

			mipmap.value!.texture.type = type;
			mipmap.value!.texture.colorSpace = colorSpace;
			mipmap.value!.dispose();

		}

		if(this.input.frameBufferPrecisionHigh) {

			this.downsamplingMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;
			this.upsamplingMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;

		} else {

			delete this.downsamplingMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;
			delete this.upsamplingMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;

		}

		this.downsamplingMaterial.needsUpdate = true;
		this.upsamplingMaterial.needsUpdate = true;

		this.onResolutionChange();

	}

	protected override onResolutionChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		// The size of the mipmaps depends on the main input buffer size.
		const inputBuffer = this.input.defaultBuffer.value;
		const imgData = inputBuffer.source.data as ImageData;
		let { width, height } = imgData;

		for(let i = 0, l = this.downsamplingMipmaps.length; i < l; ++i) {

			width = Math.round(width / 2);
			height = Math.round(height / 2);

			this.downsamplingMipmaps[i].value?.setSize(width, height);

		}

		if(this.fullResolutionUpsampling) {

			width = imgData.width;
			height = imgData.height;

		} else {

			width = Math.round(imgData.width / 2);
			height = Math.round(imgData.height / 2);

		}

		for(let i = 0, l = this.upsamplingMipmaps.length; i < l; ++i) {

			this.upsamplingMipmaps[i].value?.setSize(width, height);

			width = Math.round(width / 2);
			height = Math.round(height / 2);

		}

	}

	override render(): void {

		if(this.renderer === null || this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const renderer = this.renderer;
		const downsamplingMaterial = this.downsamplingMaterial;
		const upsamplingMaterial = this.upsamplingMaterial;
		const downsamplingMipmaps = this.downsamplingMipmaps;
		const upsamplingMipmaps = this.upsamplingMipmaps;

		let previousBuffer = this.input.defaultBuffer.value;
		const imgData = previousBuffer.source.data as ImageData;
		let { width, height } = imgData;

		// Downsample the input to the highest MIP level (smallest mipmap).
		this.fullscreenMaterial = downsamplingMaterial;

		for(let i = 0, l = downsamplingMipmaps.length; i < l; ++i) {

			const mipmap = downsamplingMipmaps[i].value!;
			downsamplingMaterial.setSize(width, height);
			downsamplingMaterial.inputBuffer = previousBuffer;
			renderer.setRenderTarget(mipmap);
			this.renderFullscreen();

			previousBuffer = mipmap.texture;
			width = mipmap.width;
			height = mipmap.height;

		}

		// Upsample the result back to the lowest MIP level (largest mipmap).
		this.fullscreenMaterial = upsamplingMaterial;

		// A + B = C, then D + C = F, etc.
		for(let i = upsamplingMipmaps.length - 1; i >= 0; --i) {

			// Full resolution upsampling uses one additional buffer.
			const j = this.fullResolutionUpsampling ? i - 1 : i;
			const supportBuffer = (j >= 0) ? downsamplingMipmaps[j].value!.texture : this.input.defaultBuffer.value;

			const mipmap = upsamplingMipmaps[i].value!;
			upsamplingMaterial.setSize(width, height);
			upsamplingMaterial.inputBuffer = previousBuffer;
			upsamplingMaterial.supportBuffer = supportBuffer;
			renderer.setRenderTarget(mipmap);
			this.renderFullscreen();

			previousBuffer = mipmap.texture;
			width = mipmap.width;
			height = mipmap.height;

		}

	}

}
