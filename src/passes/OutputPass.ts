import { Pass } from "../core/Pass.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";

/**
 * A terminal pass that renders its default input buffer to the canvas.
 *
 * @category Passes
 */

export class OutputPass extends Pass<CopyMaterial> {

	/**
	 * Constructs a new output pass.
	 */

	constructor() {

		super("OutputPass");
		this.fullscreenMaterial = new CopyMaterial();

	}

	override render(): void {

		if(!this.fullscreenMaterial.colorWrite) {

			return;

		}

		this.setRenderTarget(null);
		this.renderFullscreen();

	}

}
