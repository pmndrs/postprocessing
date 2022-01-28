import { FloatType, RGBADepthPacking } from "three";
import { DepthCopyMode } from "../materials";
import { DepthSavePass } from "./DepthSavePass";

/**
 * Unpack factors for RGBA-encoded depth.
 *
 * @type {Float32Array}
 * @private
 */

const unpackFactors = new Float32Array([
	(255 / 256) / (256 ** 3),
	(255 / 256) / (256 ** 2),
	(255 / 256) / 256,
	(255 / 256)
]);

/**
 * Unpacks RGBA-encoded depth.
 *
 * @private
 * @param {Uint8Array} packedDepth - The packed depth.
 * @return {Number} The unpacked depth.
 */

function unpackRGBAToDepth(packedDepth) {

	return (
		packedDepth[0] * unpackFactors[0] +
		packedDepth[1] * unpackFactors[1] +
		packedDepth[2] * unpackFactors[2] +
		packedDepth[3] * unpackFactors[3]
	) / 255;

}

/**
 * A depth picking pass.
 */

export class DepthPickingPass extends DepthSavePass {

	/**
	 * Constructs a new depth picking pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.depthPacking=RGBADepthPacking] - The depth packing.
	 * @param {Number} [options.mode=DepthCopyMode.SINGLE] - The depth copy mode.
	 */

	constructor({
		depthPacking = RGBADepthPacking,
		mode = DepthCopyMode.SINGLE
	} = {}) {

		super({ depthPacking });

		this.name = "DepthPickingPass";
		this.getFullscreenMaterial().setMode(mode);

		/**
		 * An RGBA pixel buffer.
		 *
		 * @type {TypedArray}
		 * @private
		 */

		this.pixelBuffer = (depthPacking === RGBADepthPacking) ?
			new Uint8Array(4) : new Float32Array(4);

		/**
		 * A callback for picking results.
		 *
		 * @type {Function}
		 * @private
		 */

		this.callback = null;

	}

	/**
	 * The depth copy mode.
	 *
	 * @type {DepthCopyMode}
	 * @private
	 */

	get mode() {

		return this.getFullscreenMaterial().getMode();

	}

	/**
	 * A screen position.
	 *
	 * @type {Vector2}
	 * @private
	 */

	get screenPosition() {

		return this.getFullscreenMaterial().uniforms.screenPosition.value;

	}

	/**
	 * Reads depth at a specific screen position.
	 *
	 * Only one depth value can be picked per frame. Calling this method multiple
	 * times per frame will overwrite the picking coordinates. Unresolved promises
	 * will be abandoned.
	 *
	 * @example
	 * const ndc = new Vector3();
	 *
	 * ndc.x = (pointerEvent.clientX / window.innerWidth) * 2.0 - 1.0;
	 * ndc.y = -(pointerEvent.clientY / window.innerHeight) * 2.0 + 1.0;
	 *
	 * const depth = await depthPickingPass.readDepth(ndc);
	 * ndc.z = depth * 2.0 - 1.0;
	 *
	 * const worldPosition = ndc.unproject(camera);
	 *
	 * @param {Vector2|Vector3} ndc - Normalized device coordinates. Only X and Y are relevant.
	 * @return {Promise<Number>} A promise that returns the depth on the next frame.
	 */

	readDepth(ndc) {

		this.screenPosition.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);

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

		if(this.mode === DepthCopyMode.FULL) {

			// Always copy the full depth texture.
			super.render(renderer);

		}

		if(this.callback !== null) {

			const renderTarget = this.renderTarget;
			const pixelBuffer = this.pixelBuffer;
			const packed = (renderTarget.texture.type !== FloatType);

			let x = 0, y = 0;

			if(this.mode === DepthCopyMode.SINGLE) {

				// Copy a specific depth value.
				super.render(renderer);

			} else {

				const screenPosition = this.screenPosition;
				x = Math.round(screenPosition.x * renderTarget.width);
				y = Math.round(screenPosition.y * renderTarget.height);

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

		if(this.mode === DepthCopyMode.FULL) {

			super.setSize(width, height);

		}

	}

}
