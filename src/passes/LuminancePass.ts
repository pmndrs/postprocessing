import { WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";

/**
 * A luminance pass.
 *
 * @group Passes
 */

export class LuminancePass extends Pass<LuminanceMaterial> {

	/**
	 * Constructs a new luminance pass.
	 */

	constructor() {

		super("LuminancePass");

		this.fullscreenMaterial = new LuminanceMaterial();
		const renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.output.defaultBuffer = renderTarget;

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
