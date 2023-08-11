import { WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * Copies the contents of the default input buffer to another buffer.
 *
 * @group Passes
 */

export class CopyPass extends Pass<CopyMaterial> {

	/**
	 * Constructs a new copy pass.
	 *
	 * @param outputBuffer - An output buffer. If not provided, the output will be rendered to screen instead.
	 */

	constructor(outputBuffer: WebGLRenderTarget | null = null) {

		super("CopyPass");

		this.fullscreenMaterial = new CopyMaterial();
		this.output.defaultBuffer = outputBuffer;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.output.defaultBuffer?.setSize(resolution.width, resolution.height);

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.inputBuffer = this.input.defaultBuffer;

		if(this.input.frameBufferPrecisionHigh) {

			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

		}

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
