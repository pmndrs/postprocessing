import { WebGLRenderer, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { blitFramebuffer } from "../utils/index.js";

/**
 * Copies the contents of the default input buffer to another buffer or to screen.
 *
 * @category Passes
 */

export class CopyPass extends Pass<CopyMaterial> {

	/**
	 * Indicates whether {@link blitFramebuffer} can be used for copying.
	 */

	private blitEnabled: boolean;

	/**
	 * Constructs a new copy pass.
	 *
	 * @param outputBuffer - An output buffer. If not provided, a new framebuffer will be created.
	 */

	constructor(outputBuffer?: WebGLRenderTarget) {

		super("CopyPass");

		this.output.defaultBuffer = outputBuffer ?? this.createFramebuffer();
		this.fullscreenMaterial = new CopyMaterial();

		this.blitEnabled = false;

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

	/**
	 * Checks if the input buffer can be copied with {@link blitFramebuffer} and updates {@link blitEnabled}.
	 */

	private setupBlit(): void {

		this.blitEnabled = false;

		const inputBuffer = this.input.defaultBuffer?.value?.renderTarget ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;

		if(inputBuffer === null || outputBuffer === null ||
			inputBuffer.texture.type !== outputBuffer.texture.type ||
			inputBuffer.texture.format !== outputBuffer.texture.format ||
			inputBuffer.width !== outputBuffer.width ||
			inputBuffer.height !== outputBuffer.height) {

			return;

		}

		const inputDepthTexture = this.input.getBuffer(GBuffer.DEPTH);

		if(inputDepthTexture !== null) {

			if(inputDepthTexture.renderTarget !== inputBuffer ||
				inputDepthTexture === outputBuffer.depthTexture ||
				inputDepthTexture.type !== outputBuffer.depthTexture?.type ||
				inputDepthTexture.format !== outputBuffer.depthTexture?.format) {

				return;

			}

		}

		this.blitEnabled = true;

	}

	/**
	 * Configures the depth buffer for copying.
	 */

	private configureDepthBuffer(): void {

		const inputDepthBuffer = this.input.getBuffer(GBuffer.DEPTH);
		const outputDepthBuffer = this.output.defaultBuffer?.value?.depthTexture ?? null;
		const inputIsOutput = (inputDepthBuffer === outputDepthBuffer);

		this.fullscreenMaterial.depthBuffer = (inputDepthBuffer === null || inputIsOutput) ? null : inputDepthBuffer;

	}

	protected override onInputChange(): void {

		this.configureDepthBuffer();
		this.setupBlit();

	}

	protected override onOutputChange(): void {

		this.configureDepthBuffer();
		this.setupBlit();
		this.initializeOutputBuffer();

	}

	protected override onResolutionChange(): void {

		this.initializeOutputBuffer();

	}

	/**
	 * Rapidly copies the contents of the input buffer into the output buffer.
	 */

	private blit(): void {

		const inputBuffer = this.input.defaultBuffer?.value?.renderTarget as WebGLRenderTarget ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;

		if(this.renderer === null || inputBuffer === null || outputBuffer === null) {

			return;

		}

		const depth = inputBuffer.depthBuffer && outputBuffer.depthBuffer;
		const stencil = inputBuffer.stencilBuffer && outputBuffer.stencilBuffer;

		blitFramebuffer(this.renderer, inputBuffer, outputBuffer, true, depth, stencil);

	}

	override render(): void {

		if(this.blitEnabled) {

			this.blit();
			return;

		}

		const material = this.fullscreenMaterial;

		if(material.colorWrite || material.depthWrite) {

			this.setRenderTarget(this.output.defaultBuffer?.value);
			this.renderFullscreen();

		}

	}

}
