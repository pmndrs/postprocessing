import { WebGLRenderer, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";

/**
 * Copies the contents of the default input buffer to another buffer or to screen.
 *
 * @category Passes
 */

export class CopyPass extends Pass<CopyMaterial> {

	/**
	 * Constructs a new copy pass.
	 *
	 * @param outputBuffer - An output buffer. If not provided, a new framebuffer will be created.
	 */

	constructor(outputBuffer?: WebGLRenderTarget) {

		super("CopyPass");

		this.output.defaultBuffer = outputBuffer ?? this.createFramebuffer();
		this.fullscreenMaterial = new CopyMaterial();

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;
		this.initializeOutputBuffer();

	}

	/**
	 * Initializes the current output buffer.
	 */

	private initializeOutputBuffer(): void {

		const outputBuffer = this.output.defaultBuffer?.value ?? null;

		if(this.renderer !== null && outputBuffer !== null) {

			this.renderer.initRenderTarget(outputBuffer);

		}

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.getBuffer(GBuffer.DEPTH);

	}

	protected override onOutputChange(): void {

		this.initializeOutputBuffer();

	}

	protected override onResolutionChange(): void {

		this.initializeOutputBuffer();

	}

	/**
	 * Rapidly copies the input buffer into the output buffer.
	 *
	 * @return True, if the operation was successful.
	 */

	private blit(): boolean {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;

		if(this.renderer === null || inputBuffer === null || outputBuffer === null) {

			return false;

		}

		const imgData = inputBuffer.source.data as ImageData;

		if(imgData.width !== outputBuffer.width || imgData.height !== outputBuffer.height) {

			return false;

		}

		if(inputBuffer.type === outputBuffer.texture.type &&
			inputBuffer.format === outputBuffer.texture.format) {

			this.renderer.copyTextureToTexture(inputBuffer, outputBuffer.texture);

		}

		const inputDepthTexture = this.input.getBuffer(GBuffer.DEPTH);

		if(inputDepthTexture !== null && outputBuffer.depthTexture !== null &&
			inputDepthTexture !== outputBuffer.depthTexture &&
			inputDepthTexture.type === outputBuffer.depthTexture.type &&
			inputDepthTexture.format === outputBuffer.depthTexture.format) {

			this.renderer.copyTextureToTexture(inputDepthTexture, outputBuffer.depthTexture);

		}

		return true;

	}

	override render(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;

		if(this.renderer === null || inputBuffer === null) {

			return;

		}

		if(!this.blit()) {

			// Blit failed: use a shader to copy the input buffer.
			this.setRenderTarget(this.output.defaultBuffer?.value ?? null);
			this.renderFullscreen();

		}

	}

}
