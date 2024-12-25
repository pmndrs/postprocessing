import { FloatType, NearestFilter, WebGLRenderTarget } from "three";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { DepthCopyMaterial } from "../materials/DepthCopyMaterial.js";

/**
 * A pass that copies depth into a render target.
 *
 * @category Passes
 */

export class DepthCopyPass extends Pass<DepthCopyMaterial> {

	/**
	 * Identifies the depth output buffer.
	 */

	private static readonly BUFFER_DEPTH = "BUFFER_DEPTH";

	/**
	 * Constructs a new depth copy pass.
	 */

	constructor() {

		super("DepthCopyPass");

		this.fullscreenMaterial = new DepthCopyMaterial();
		this.input.gBuffer.add(GBuffer.DEPTH);

		this.output.setBuffer(DepthCopyPass.BUFFER_DEPTH, new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		}));

	}

	/**
	 * The depth render target.
	 */

	protected get renderTarget(): WebGLRenderTarget {

		return this.output.getBuffer(DepthCopyPass.BUFFER_DEPTH)!;

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(DepthCopyPass.BUFFER_DEPTH)!.texture;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.getBuffer(GBuffer.DEPTH);

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
