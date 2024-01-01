import { WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * Copies the contents of the default input buffer to another buffer or to screen.
 *
 * @group Passes
 */

export class CopyPass extends Pass<CopyMaterial> {

	/**
	 * Constructs a new copy pass.
	 *
	 * @param outputBuffer - An output buffer. If not provided, the input will be rendered to screen.
	 */

	constructor(outputBuffer: WebGLRenderTarget | null = null) {

		super("CopyPass");

		this.fullscreenMaterial = new CopyMaterial();
		this.output.defaultBuffer = outputBuffer;

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
