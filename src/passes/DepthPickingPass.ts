import { FloatType, Vector2, Vector3 } from "three";
import { DepthCopyMode } from "../enums/DepthCopyMode.js";
import { unpackRGBAToFloat } from "../utils/packing.js";
import { DepthCopyPass } from "./DepthCopyPass.js";

const floatPixelBuffer = new Float32Array(4);
const uint8PixelBuffer = new Uint8Array(4);

/**
 * A depth picking pass.
 *
 * @group Passes
 */

export class DepthPickingPass extends DepthCopyPass {

	/**
	 * A callback that handles picking results.
	 */

	private callback: ((value: number) => void) | null;

	/**
	 * Constructs a new depth picking pass.
	 *
	 * @param mode - The depth copy mode.
	 */

	constructor(mode = DepthCopyMode.SINGLE) {

		super();

		this.name = "DepthPickingPass";
		this.fullscreenMaterial.mode = mode;
		this.callback = null;

		if(mode === DepthCopyMode.SINGLE) {

			this.resolution.setPreferredSize(1, 1);

		}

	}

	/**
	 * Reads depth at a specific screen position.
	 *
	 * Only one depth value can be picked per frame. Calling this method multiple times per frame will overwrite the
	 * picking coordinates. Unresolved promises will be abandoned.
	 *
	 * @param ndc - Normalized device coordinates. Only X and Y are relevant.
	 * @return A promise that returns the depth on the next frame.
	 * @example
	 * const ndc = new Vector3();
	 * const clientRect = myViewport.getBoundingClientRect();
	 * const clientX = pointerEvent.clientX - clientRect.left;
	 * const clientY = pointerEvent.clientY - clientRect.top;
	 * ndc.x = (clientX / myViewport.clientWidth) * 2.0 - 1.0;
	 * ndc.y = -(clientY / myViewport.clientHeight) * 2.0 + 1.0;
	 * const depth = await depthPickingPass.readDepth(ndc);
	 * ndc.z = depth * 2.0 - 1.0;
	 * const worldPosition = ndc.unproject(camera);
	 */

	readDepth(ndc: Vector2 | Vector3): Promise<number> {

		this.fullscreenMaterial.texelPosition.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);

		return new Promise((resolve) => {

			this.callback = resolve;

		});

	}

	override render(): void {

		const material = this.fullscreenMaterial;
		const mode = material.mode;

		if(mode === DepthCopyMode.FULL) {

			// Always copy the full depth texture.
			super.render();

		}

		if(this.callback !== null) {

			const renderTarget = this.renderTarget;
			const packed = (renderTarget.texture.type !== FloatType);

			let x = 0, y = 0;

			if(mode === DepthCopyMode.SINGLE) {

				// Copy a specific depth value.
				super.render();

			} else {

				const texelPosition = material.texelPosition;
				x = Math.round(texelPosition.x * renderTarget.width);
				y = Math.round(texelPosition.y * renderTarget.height);

			}

			const pixelBuffer = packed ? uint8PixelBuffer : floatPixelBuffer;
			this.renderer?.readRenderTargetPixels(renderTarget, x, y, 1, 1, pixelBuffer);
			this.callback(packed ? unpackRGBAToFloat(uint8PixelBuffer) : floatPixelBuffer[0]);
			this.callback = null;

		}

	}

}
