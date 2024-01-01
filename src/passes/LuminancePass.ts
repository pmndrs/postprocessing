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

		this.output.defaultBuffer = this.createFramebuffer();
		this.fullscreenMaterial = new LuminanceMaterial();

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
