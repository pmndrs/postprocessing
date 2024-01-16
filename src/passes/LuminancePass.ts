import { Texture } from "three";
import { Pass } from "../core/Pass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";

/**
 * A luminance pass.
 *
 * @category Passes
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

	/**
	 * The output texture.
	 */

	get texture(): Texture {

		return this.output.defaultBuffer!.texture as Texture;

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null) {

			return;

		}

		this.texture.type = this.input.defaultBuffer.type;
		this.texture.colorSpace = this.input.defaultBuffer.colorSpace;

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
