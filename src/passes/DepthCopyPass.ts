import { FloatType, NearestFilter, Texture, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { DepthCopyMaterial } from "../materials/DepthCopyMaterial.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * A pass that copies depth into a render target.
 *
 * @group Passes
 */

export class DepthCopyPass extends Pass<DepthCopyMaterial> {

	/**
	 * Identifies the depth output buffer.
	 */

	static readonly OUTPUT_BUFFER_DEPTH: string = "buffer.depth";

	/**
	 * Constructs a new depth copy pass.
	 */

	constructor() {

		super("DepthCopyPass");

		this.fullscreenMaterial = new DepthCopyMaterial();
		this.input.buffers.set(GBuffer.DEPTH, null);
		this.output.buffers.set(DepthCopyPass.OUTPUT_BUFFER_DEPTH, new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		}));

	}

	protected get renderTarget(): WebGLRenderTarget {

		return this.output.buffers.get(DepthCopyPass.OUTPUT_BUFFER_DEPTH) as WebGLRenderTarget;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.buffers.get(GBuffer.DEPTH) as Texture;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.renderTarget.setSize(resolution.width, resolution.height);

	}

	render(): void {

		this.renderer?.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
