import { FloatType, NearestFilter } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { DepthCopyMode } from "../enums/DepthCopyMode.js";
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
	 * The depth render target resource.
	 */

	private readonly buffer: RenderTargetResource;

	/**
	 * Constructs a new depth copy pass.
	 */

	constructor() {

		super("DepthCopyPass");

		this.fullscreenMaterial = new DepthCopyMaterial();
		this.requireTextures(GBuffer.DEPTH);

		this.buffer = this.setBuffer(DepthCopyPass.BUFFER_DEPTH, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});

	}

	/**
	 * The copied depth texture.
	 */

	get texture(): TextureResource {

		return this.buffer.texture;

	}

	/**
	 * The current depth copy mode.
	 */

	get mode(): DepthCopyMode {

		return this.fullscreenMaterial.mode;

	}

	set mode(value: DepthCopyMode) {

		this.fullscreenMaterial.mode = value;

		if(value === DepthCopyMode.SINGLE) {

			this.resolution.setPreferredSize(1, 1);

		} else {

			this.resolution.resetPreferredSize();

		}

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.buffers.get(GBuffer.DEPTH)?.value ?? null;

	}

	override render(): void {

		this.setRenderTarget(this.buffer.value);
		this.renderFullscreen();

	}

}
