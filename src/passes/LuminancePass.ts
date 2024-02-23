import { Texture, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { LuminanceMaterial } from "../materials/LuminanceMaterial.js";
import { Resolution } from "../utils/Resolution.js";

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

		this.renderTarget = this.createFramebuffer();
		this.fullscreenMaterial = new LuminanceMaterial();

	}

	/**
	 * The luminance render target.
	 */

	private get renderTarget(): WebGLRenderTarget {

		return this.output.buffers.get(LuminancePass.BUFFER_LUMINANCE)!.value as WebGLRenderTarget;

	}

	private set renderTarget(value: WebGLRenderTarget) {

		this.output.setBuffer(LuminancePass.BUFFER_LUMINANCE, value);

	}

	/**
	 * The output texture.
	 */

	get texture(): Texture {

		return this.renderTarget.texture;

	}

	protected override onInputChange(): void {

		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		this.texture.type = inputTexture.type;
		this.texture.colorSpace = inputTexture.colorSpace;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.renderTarget.setSize(resolution.width, resolution.height);

	}

	render(): void {

		this.renderer?.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
