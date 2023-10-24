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
	 * Reads depth at a specific texture position.
	 *
	 * @param x - The X-coordinate.
	 * @param x - The Y-coordinate.
	 * @return The depth value.
	 */

	private readDepthAt(x: number, y: number): number {

		const renderTarget = this.renderTarget;
		const packed = (renderTarget.texture.type !== FloatType);
		const pixelBuffer = packed ? uint8PixelBuffer : floatPixelBuffer;
		this.renderer?.readRenderTargetPixels(renderTarget, x, y, 1, 1, pixelBuffer);

		return packed ? unpackRGBAToFloat(uint8PixelBuffer) : floatPixelBuffer[0];

	}

	/**
	 * Reads depth at a specific screen position.
	 *
	 * If the mode is set to {@link DepthCopyMode.SINGLE}, only one depth value can be picked per frame. Calling this
	 * method multiple times per frame will then overwrite the picking coordinates. Unresolved promises will be abandoned.
	 *
	 * @param ndc - Normalized device coordinates. Only X and Y are relevant.
	 * @return A promise that returns the depth.
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

			if(this.fullscreenMaterial.mode === DepthCopyMode.SINGLE) {

				// The specific depth value needs to be copied before it can be read.
				this.callback = resolve;

			} else {

				// The depth values from the current or last frame are already available.
				const texelPosition = this.fullscreenMaterial.texelPosition;
				const x = Math.round(texelPosition.x * this.renderTarget.width);
				const y = Math.round(texelPosition.y * this.renderTarget.height);
				resolve(this.readDepthAt(x, y));

			}

		});

	}

	override render(): void {

		if(this.fullscreenMaterial.mode === DepthCopyMode.FULL) {

			// Always update the full depth buffer.
			super.render();

		} else if(this.callback !== null) {

			// Copy a specific depth value on demand.
			super.render();

			this.callback(this.readDepthAt(0, 0));
			this.callback = null;

		}

	}

}
