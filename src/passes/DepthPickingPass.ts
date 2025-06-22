import { Vector2, Vector3 } from "three";
import { DepthCopyMode } from "../enums/DepthCopyMode.js";
import { DepthCopyPass } from "./DepthCopyPass.js";

const pixelBuffer = new Float32Array(4);

/**
 * A depth picking pass.
 *
 * @category Passes
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
		this.mode = mode;

	}

	/**
	 * Reads depth at a specific texture position.
	 *
	 * @param x - The X-coordinate.
	 * @param x - The Y-coordinate.
	 * @return The depth value.
	 */

	private readDepthAt(x: number, y: number): number {

		const renderer = this.renderer;

		if(renderer === null) {

			return 0.0;

		}

		renderer.readRenderTargetPixels(this.renderTarget, x, y, 1, 1, pixelBuffer);
		const depth = pixelBuffer[0];

		if(renderer.capabilities.reverseDepthBuffer) {

			return 1.0 - depth;

		} else if(renderer.capabilities.logarithmicDepthBuffer) {

			if(this.camera === null) {

				return 0.0;

			}

			const camera = this.camera;
			const d = Math.pow(2.0, depth * Math.log2(camera.far + 1.0)) - 1.0;
			const a = camera.far / (camera.far - camera.near);
			const b = camera.far * camera.near / (camera.near - camera.far);
			return a + b / d;

		}

		return depth;

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
				const renderTarget = this.renderTarget;
				const texelPosition = this.fullscreenMaterial.texelPosition;
				const x = Math.round(texelPosition.x * renderTarget.width);
				const y = Math.round(texelPosition.y * renderTarget.height);
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
