import { Texture, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { DownsamplingMaterial } from "../materials/DownsamplingMaterial.js";
import { UpsamplingMaterial } from "../materials/UpsamplingMaterial.js";
import { Resolution } from "../utils/Resolution.js";

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
	 * The mipmaps used for downsampling.
	 */

	private downsamplingMipmaps: WebGLRenderTarget[];

	/**
	 * The mipmaps used for upsampling.
	 */

	private upsamplingMipmaps: WebGLRenderTarget[];

	/**
	 * A downsampling material.
	 */

	private downsamplingMaterial: DownsamplingMaterial;

	/**
	 * An upsampling material.
	*/

	private upsamplingMaterial: UpsamplingMaterial;

	/**
	 * Constructs a new mipmap blur pass.
	 */

	constructor() {

		super("MipmapBlurPass");

		const renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		renderTarget.texture.name = "Upsampling.Mipmap0";
		this.output.defaultBuffer = renderTarget;

		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];

		this.downsamplingMaterial = new DownsamplingMaterial();
		this.upsamplingMaterial = new UpsamplingMaterial();

	}

	/**
	 * A texture that contains the blurred result.
	 */

	get texture(): Texture | null {

		return this.output.defaultBuffer?.texture.value ?? null;

	}

	/**
	 * The MIP levels.
	 *
	 * @defaultValue 8
	 */

	get levels(): number {

		return this.downsamplingMipmaps.length;

	}

	set levels(value: number) {

		if(this.levels === value || this.output.defaultBuffer === null) {

			return;

		}

		const renderTarget = this.output.defaultBuffer.value as WebGLRenderTarget;

		this.dispose();
		this.disposables.clear();

		this.downsamplingMipmaps = [];
		this.upsamplingMipmaps = [];

		for(let i = 0; i < value; ++i) {

			const mipmap = renderTarget.clone();
			mipmap.texture.name = "Downsampling.Mipmap" + i;
			this.downsamplingMipmaps.push(mipmap);
			this.disposables.add(mipmap);

		}

		this.upsamplingMipmaps.push(renderTarget);

		for(let i = 1, l = value - 1; i < l; ++i) {

			const mipmap = renderTarget.clone();
			mipmap.texture.name = "Upsampling.Mipmap" + i;
			this.upsamplingMipmaps.push(mipmap);
			this.disposables.add(mipmap);

		}

		this.onResolutionChange(this.resolution);

	}

	/**
	 * The blur radius.
	 */

	get radius(): number {

		return this.upsamplingMaterial.radius;

	}

	set radius(value: number) {

		this.upsamplingMaterial.radius = value;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		let w = resolution.width;
		let h = resolution.height;

		for(let i = 0, l = this.downsamplingMipmaps.length; i < l; ++i) {

			w = Math.round(w * 0.5);
			h = Math.round(h * 0.5);

			this.downsamplingMipmaps[i].setSize(w, h);

			if(i < this.upsamplingMipmaps.length) {

				this.upsamplingMipmaps[i].setSize(w, h);

			}

		}

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const { type, colorSpace } = this.input.defaultBuffer.value;

		for(const mipmap of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) {

			mipmap.texture.type = type;
			mipmap.texture.colorSpace = colorSpace;
			mipmap.dispose();

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

	}

	override render(): void {

		if(this.renderer === null || this.input.defaultBuffer?.value === null) {

			return;

		}

		const renderer = this.renderer;
		const downsamplingMaterial = this.downsamplingMaterial;
		const upsamplingMaterial = this.upsamplingMaterial;
		const downsamplingMipmaps = this.downsamplingMipmaps;
		const upsamplingMipmaps = this.upsamplingMipmaps;

		let previousBuffer = this.input.defaultBuffer!.value;
		let { width, height } = this.resolution;

		// Downsample the input to the highest MIP level (smallest mipmap).
		this.fullscreenMaterial = downsamplingMaterial;

		for(let i = 0, l = downsamplingMipmaps.length; i < l; ++i) {

			const mipmap = downsamplingMipmaps[i];
			downsamplingMaterial.setSize(width, height);
			downsamplingMaterial.inputBuffer = previousBuffer;
			renderer.setRenderTarget(mipmap);
			this.renderFullscreen();

			previousBuffer = mipmap.texture;
			width = mipmap.width;
			height = mipmap.height;

		}

		// Upsample the result back to the lowest MIP level (largest mipmap, half resolution).
		this.fullscreenMaterial = upsamplingMaterial;

		// A + B = C, then D + C = F, etc.
		for(let i = upsamplingMipmaps.length - 1; i >= 0; --i) {

			const mipmap = upsamplingMipmaps[i];
			upsamplingMaterial.setSize(width, height);
			upsamplingMaterial.inputBuffer = previousBuffer;
			upsamplingMaterial.supportBuffer = downsamplingMipmaps[i].texture;
			renderer.setRenderTarget(mipmap);
			this.renderFullscreen();

			previousBuffer = mipmap.texture;
			width = mipmap.width;
			height = mipmap.height;

		}

	}

}
