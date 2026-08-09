import { GBuffer } from "../enums/GBuffer.js";
import { CopyPass } from "./CopyPass.js";
import { GeometryPass, GeometryPassOptions } from "./GeometryPass.js";

/**
 * A user interface pass.
 *
 * @category Passes
 */

export class UIPass extends GeometryPass {

	/**
	 * A pass that copies the default input buffer to the default output buffer.
	 *
	 * This pass will be disabled if the buffers are the same or the output buffer has multiple texture attachments.
	 */

	protected readonly copyPass: CopyPass;

	/**
	 * Constructs a new user interface pass.
	 *
	 * @param options - The options.
	 */

	constructor(options?: GeometryPassOptions) {

		super(options);

		this.copyPass = new CopyPass();
		this.copyPass.enabled = false;
		this.subpasses = [this.copyPass];

	}

	/**
	 * Configures the internal {@link copyPass}.
	 */

	private configureCopyPass(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;
		const inputIsOutput = (inputBuffer === outputBuffer?.texture);
		const outputIsMRT = ((outputBuffer?.textures.length ?? 0) > 1);

		this.copyPass.enabled = (inputBuffer !== null && !inputIsOutput && !outputIsMRT);

	}

	protected override onInputChange(): void {

		super.onInputChange();

		this.copyPass.input.defaultBuffer = this.input.defaultBuffer;
		const depthTextureResource = this.input.buffers.get(GBuffer.DEPTH);

		if(depthTextureResource !== undefined) {

			this.copyPass.input.setBuffer(GBuffer.DEPTH, depthTextureResource);

		} else {

			this.copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

		this.configureCopyPass();

	}

	protected override onOutputChange(): void {

		super.onOutputChange();

		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;
		this.configureCopyPass();

	}

	protected override onResolutionChange(): void {

		super.onResolutionChange();
		this.copyPass.resolution.copy(this.resolution);

	}

	protected override onScissorChange(): void {

		super.onScissorChange();
		this.copyPass.scissor.copy(this.scissor);

	}

	protected override onViewportChange(): void {

		super.onViewportChange();
		this.copyPass.viewport.copy(this.viewport);

	}

	override render(): void {

		this.renderSubpasses();
		super.render();

	}

}
