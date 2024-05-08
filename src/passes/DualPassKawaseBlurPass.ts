import { Texture, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { Resolution } from "../utils/Resolution.js";
import { KawaseDownsamplingMaterial, KawaseUpsamplingMaterial } from "postprocessing";

/**
 * DualPassKawaseBlurPass constructor options.
 *
 * @category Passes
 */

export interface DualPassKawaseBlurPassOptions {

	/**
	 * The scale of the blur kernel.
	 *
	 * @defaultValue 0.35
	 */

	scale?: number;

	/**
	 * The number of up/downsample passes performed.
	 *
	 * @defaultValue 2
	 */

	levels?: number;

}

/**
 * A multi pass Kawase blur pass.
 *
 * @category Passes
 */

export class DualPassKawaseBlurPass extends Pass<KawaseDownsamplingMaterial | KawaseUpsamplingMaterial> {

	private static readonly BUFFER_KAWASE = "BUFFER_KAWASE";

	/**
	 * The render targets used for downsampling passes.
	 */

	private downsamplingTargets: WebGLRenderTarget[];

	/**
	 * The render targets used for upsampling passes.
	 */

	private upsamplingTargets: WebGLRenderTarget[];

	/**
	 * The downsampling material.
	 */

	downsamplingMaterial: KawaseDownsamplingMaterial;

	/**
	 * The upsampling material.
	*/

	upsamplingMaterial: KawaseUpsamplingMaterial;

	/**
	 * Constructs a new multi pass Kawase blur pass.
	 */

	constructor({
		levels = 2,
		scale = 0.35
	}: DualPassKawaseBlurPassOptions = {}) {

		super("DualPassKawaseBlurPass");

		this.output.setBuffer(DualPassKawaseBlurPass.BUFFER_KAWASE, this.createFramebuffer());
		this.renderTarget.texture.name = "BUFFER_KAWASE";

		this.downsamplingTargets = [];
		this.upsamplingTargets = [];

		this.downsamplingMaterial = new KawaseDownsamplingMaterial({ scale });
		this.upsamplingMaterial = new KawaseUpsamplingMaterial({ scale });

		this.levels = levels;

	}

	private get renderTarget(): WebGLRenderTarget {

		return this.output.buffers.get(DualPassKawaseBlurPass.BUFFER_KAWASE)!.value as WebGLRenderTarget;

	}

	private set renderTarget(value: WebGLRenderTarget) {

		this.output.setBuffer(DualPassKawaseBlurPass.BUFFER_KAWASE, value);

	}

	/**
	 * A texture that contains the blurred result.
	 */

	get texture(): Texture {

		return this.renderTarget.texture;

	}

	/**
	 * The number of up/downsample passes performed.
	 *
	 * @defaultValue 2
	 */

	get levels(): number {

		return this.downsamplingTargets.length;

	}

	set levels(value: number) {

		if(this.levels === value) {

			return;

		}

		const renderTarget = this.renderTarget;
		const output = this.output;

		this.dispose();
		this.disposables.clear();
		output.buffers.clear();

		this.downsamplingTargets = [];
		this.upsamplingTargets = [];

		for(let i = 0; i < value; ++i) {

			const target = renderTarget.clone();
			target.texture.name = "Downsampling.Target" + i;
			this.downsamplingTargets.push(target);
			this.disposables.add(target);
			output.setBuffer(target.texture.name.toUpperCase(), target);

		}

		this.upsamplingTargets.push(renderTarget);
		output.setBuffer(DualPassKawaseBlurPass.BUFFER_KAWASE, renderTarget);

		for(let i = 0; i < value; ++i) {

			const target = renderTarget.clone();
			target.texture.name = "Upsampling.Target" + i;
			this.upsamplingTargets.push(target);
			this.disposables.add(target);
			output.setBuffer(target.texture.name.toUpperCase(), target);

		}

		this.onResolutionChange(this.resolution);

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const { type, colorSpace } = this.input.defaultBuffer.value;

		for(const target of this.downsamplingTargets.concat(this.upsamplingTargets)) {

			target.texture.type = type;
			target.texture.colorSpace = colorSpace;
			target.dispose();

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

	protected override onResolutionChange(resolution: Resolution): void {

		let { width, height } = resolution;

		for(let i = 0; i < this.levels; ++i) {

			width = Math.round(width * 0.5);
			height = Math.round(height * 0.5);

			this.downsamplingTargets[i].setSize(width, height);

		}

		for(let i = 0; i < this.levels; ++i) {

			width = Math.round(width * 2);
			height = Math.round(height * 2);

			this.upsamplingTargets[i].setSize(width, height);

		}

	}

	render(): void {

		if(this.renderer === null || !this.input.defaultBuffer || this.input.defaultBuffer.value === null) {

			return;

		}

		const renderer = this.renderer;
		const downsamplingMaterial = this.downsamplingMaterial;
		const upsamplingMaterial = this.upsamplingMaterial;

		let previousBuffer = this.input.defaultBuffer.value;

		let { width, height } = this.resolution;


		// TODO: unsure about what to assign as the fullscreen material when the pass requires multiple
		this.fullscreenMaterial = downsamplingMaterial;

		for(let i = 0; i < this.levels; ++i) {

			const target = this.downsamplingTargets[i];
			downsamplingMaterial.setSize(width, height);
			downsamplingMaterial.inputBuffer = previousBuffer;
			renderer.setRenderTarget(target);
			this.renderFullscreen();

			previousBuffer = target.texture;
			width = target.width;
			height = target.height;

		}

		this.fullscreenMaterial = upsamplingMaterial;

		for(let i = 0; i < this.levels; ++i) {

			const target = this.upsamplingTargets[i];
			upsamplingMaterial.setSize(width, height);
			upsamplingMaterial.inputBuffer = previousBuffer;
			renderer.setRenderTarget(target);
			this.renderFullscreen();

			previousBuffer = target.texture;
			width = target.width;
			height = target.height;

		}

	}

}
