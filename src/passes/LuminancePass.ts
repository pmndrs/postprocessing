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

	get texture(): Texture | null {

		return this.output.defaultBuffer?.texture.value ?? null;

	}

	protected override onInputChange(): void {

		const inputTexture = this.input.defaultBuffer?.value ?? null;
		const outputTexture = this.texture;

		if(inputTexture === null || outputTexture === null) {

			return;

		}

		outputTexture.type = inputTexture.type;
		outputTexture.colorSpace = inputTexture.colorSpace;

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		this.renderFullscreen();

	}

}
