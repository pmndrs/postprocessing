import { BasicDepthPacking, FloatType, REVISION, RGBADepthPacking } from "three";
import { DepthCopyMode } from "../enums/DepthCopyMode.js";
import { DepthCopyPass } from "./DepthCopyPass.js";

const threeRevision = Number(REVISION.replace(/\D+/g, ""));
const unpackDownscale = 255 / 256; // 0..1 -> fraction (excluding 1)

const unpackFactorsLegacy = new Float32Array([
	unpackDownscale / (256 ** 3),
	unpackDownscale / (256 ** 2),
	unpackDownscale / 256,
	unpackDownscale
]);

const unpackFactors = new Float32Array([
	unpackDownscale,
	unpackDownscale / 256,
	unpackDownscale / (256 ** 2),
	1 / (256 ** 3)
]);

/**
 * Unpacks RGBA-encoded depth.
 *
 * @private
 * @param {Uint8Array} packedDepth - The packed depth.
 * @return {Number} The unpacked depth.
 */

function unpackRGBAToDepth(packedDepth) {

	// Packing was changed in r167.
	const f = (threeRevision >= 167) ? unpackFactors : unpackFactorsLegacy;

	return (
		packedDepth[0] * f[0] +
		packedDepth[1] * f[1] +
		packedDepth[2] * f[2] +
		packedDepth[3] * f[3]
	) / 255;

}

/**
 * A depth picking pass.
 */

export class DepthPickingPass extends DepthCopyPass {

	/**
	 * Constructs a new depth picking pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {DepthPackingStrategies} [options.depthPacking=RGBADepthPacking] - The depth packing.
	 * @param {Number} [options.mode=DepthCopyMode.SINGLE] - The depth copy mode.
	 */

	constructor({ depthPacking = RGBADepthPacking, mode = DepthCopyMode.SINGLE } = {}) {

		if(depthPacking !== RGBADepthPacking && depthPacking !== BasicDepthPacking) {

			throw new Error(`Unsupported depth packing: ${depthPacking}`);

		}

		super({ depthPacking });

		this.name = "DepthPickingPass";
		this.fullscreenMaterial.mode = mode;

		/**
		 * An RGBA pixel buffer.
		 *
		 * @type {TypedArray}
		 * @private
		 */

		this.pixelBuffer = (depthPacking === RGBADepthPacking) ? new Uint8Array(4) : new Float32Array(4);

		/**
		 * A callback for picking results.
		 *
		 * @type {Function}
		 * @private
		 */

		this.callback = null;

	}

	/**
	 * Reads depth at a specific screen position.
	 *
	 * Only one depth value can be picked per frame. Calling this method multiple times per frame will overwrite the
	 * picking coordinates. Unresolved promises will be abandoned.
	 *
	 * @example
	 * const ndc = new Vector3();
	 * const clientRect = myViewport.getBoundingClientRect();
	 * const clientX = pointerEvent.clientX - clientRect.left;
	 * const clientY = pointerEvent.clientY - clientRect.top;
	 * ndc.x = (clientX / myViewport.clientWidth) * 2.0 - 1.0;
	 * ndc.y = -(clientY / myViewport.clientHeight) * 2.0 + 1.0;
	 * const depth = await depthPickingPass.readDepth(ndc);
	 * ndc.z = depth * 2.0 - 1.0;
	 *
	 * const worldPosition = ndc.unproject(camera);
	 *
	 * @param {Vector2|Vector3} ndc - Normalized device coordinates. Only X and Y are relevant.
	 * @return {Promise<Number>} A promise that returns the depth on the next frame.
	 */

	readDepth(ndc) {

		this.fullscreenMaterial.texelPosition.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);

		return new Promise((resolve) => {

			this.callback = resolve;

		});

	}

	/**
	 * Copies depth and resolves depth picking promises.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const material = this.fullscreenMaterial;
		const mode = material.mode;

		if(mode === DepthCopyMode.FULL) {

			// Always copy the full depth texture.
			super.render(renderer);

		}

		if(this.callback !== null) {

			const renderTarget = this.renderTarget;
			const pixelBuffer = this.pixelBuffer;
			const packed = (renderTarget.texture.type !== FloatType);

			let x = 0, y = 0;

			if(mode === DepthCopyMode.SINGLE) {

				// Copy a specific depth value.
				super.render(renderer);

			} else {

				const texelPosition = material.texelPosition;
				x = Math.round(texelPosition.x * renderTarget.width);
				y = Math.round(texelPosition.y * renderTarget.height);

			}

			renderer.readRenderTargetPixels(renderTarget, x, y, 1, 1, pixelBuffer);
			this.callback(packed ? unpackRGBAToDepth(pixelBuffer) : pixelBuffer[0]);
			this.callback = null;

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		if(this.fullscreenMaterial.mode === DepthCopyMode.FULL) {

			super.setSize(width, height);

		}

	}

}
