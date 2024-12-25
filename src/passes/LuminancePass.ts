import { WebGLRenderTarget } from "three";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";

/**
 * A luminance pass.
 *
 * @category Passes
 */

export class LuminancePass extends Pass<LuminanceMaterial> {

	/**
	 * Identifies the luminance output buffer.
	 */

	private static readonly BUFFER_LUMINANCE = "BUFFER_LUMINANCE";

	/**
	 * Constructs a new luminance pass.
	 */

	constructor() {

		super("LuminancePass");

		this.output.setBuffer(LuminancePass.BUFFER_LUMINANCE, this.createFramebuffer());
		this.fullscreenMaterial = new LuminanceMaterial();

	}

	/**
	 * The luminance render target.
	 */

	private get renderTarget(): WebGLRenderTarget {

		return this.output.getBuffer(LuminancePass.BUFFER_LUMINANCE)!;

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(LuminancePass.BUFFER_LUMINANCE)!.texture;

	}

	protected override onInputChange(): void {

		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		this.renderTarget.texture.type = inputTexture.type;
		this.renderTarget.texture.colorSpace = inputTexture.colorSpace;

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		this.renderTarget.setSize(resolution.width, resolution.height);

	}

	override render(): void {

		this.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
