import { WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";

/**
 * Copies the contents of the default input buffer to another buffer or to screen.
 *
 * @group Passes
 */

export class CopyPass extends Pass<CopyMaterial> {

	/**
	 * Constructs a new copy pass.
	 *
	 * @param outputBuffer - An output buffer. If not provided, a new framebuffer will be created.
	 */

	constructor(outputBuffer?: WebGLRenderTarget) {

		super("CopyPass");

		this.output.defaultBuffer = outputBuffer || this.createFramebuffer();
		this.fullscreenMaterial = new CopyMaterial();

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
