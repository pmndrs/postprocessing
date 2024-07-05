import { SRGBColorSpace, UnsignedByteType, Vector2, WebGLRenderTarget } from "three";
import { DownsamplingMaterial } from "../materials/DownsamplingMaterial.js";
import { UpsamplingMaterial } from "../materials/UpsamplingMaterial.js";
import { Pass } from "./Pass.js";

/**
 * A blur pass that produces a wide blur by downsampling and upsampling the input over multiple MIP levels.
 *
 * Based on an article by Fabrice Piquet:
 * https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 */

export class MipmapBlurPass extends Pass {

	/**
	 * Constructs a new mipmap blur pass.
	 *
	 * @param {Object} [options] - The options.
	 */

	constructor() {

		super("MipmapBlurPass");

		this.needsSwap = false;

		/**
		 * The output render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "Upsampling.Mipmap0";

		/**
		 * The mipmaps used for downsampling.
		 *
		 * @type {WebGLRenderTarget[]}
		 * @private
		 * @readonly
		 */

		this.downsamplingMipmaps = [];

		/**
		 * The mipmaps used for upsampling.
		 *
		 * @type {WebGLRenderTarget[]}
		 * @private
		 * @readonly
		 */

		this.upsamplingMipmaps = [];

		/**
		 * A downsampling material.
		 *
		 * @type {DownsamplingMaterial}
		 * @private
		 */

		this.downsamplingMaterial = new DownsamplingMaterial();

		/**
		 * An upsampling material.
		 *
		 * @type {UpsamplingMaterial}
		 * @private
		 */

		this.upsamplingMaterial = new UpsamplingMaterial();

		/**
		 * The current resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

	}

	/**
	 * A texture that contains the blurred result.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * The MIP levels. Default is 8.
	 *
	 * @type {Number}
	 */

	get levels() {

		return this.downsamplingMipmaps.length;

	}

	set levels(value) {

		if(this.levels !== value) {

			const renderTarget = this.renderTarget;

			this.dispose();
			this.downsamplingMipmaps = [];
			this.upsamplingMipmaps = [];

			for(let i = 0; i < value; ++i) {

				const mipmap = renderTarget.clone();
				mipmap.texture.name = "Downsampling.Mipmap" + i;
				this.downsamplingMipmaps.push(mipmap);

			}

			this.upsamplingMipmaps.push(renderTarget);

			for(let i = 1, l = value - 1; i < l; ++i) {

				const mipmap = renderTarget.clone();
				mipmap.texture.name = "Upsampling.Mipmap" + i;
				this.upsamplingMipmaps.push(mipmap);

			}

			this.setSize(this.resolution.x, this.resolution.y);

		}

	}

	/**
	 * The blur radius.
	 *
	 * @type {Number}
	 */

	get radius() {

		return this.upsamplingMaterial.radius;

	}

	set radius(value) {

		this.upsamplingMaterial.radius = value;

	}

	/**
	 * Renders the blur.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const { scene, camera } = this;
		const { downsamplingMaterial, upsamplingMaterial } = this;
		const { downsamplingMipmaps, upsamplingMipmaps } = this;

		let previousBuffer = inputBuffer;

		// Downsample the input to the highest MIP level (smallest mipmap).
		this.fullscreenMaterial = downsamplingMaterial;

		for(let i = 0, l = downsamplingMipmaps.length; i < l; ++i) {

			const mipmap = downsamplingMipmaps[i];
			downsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
			downsamplingMaterial.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(scene, camera);
			previousBuffer = mipmap;

		}

		// Upsample the result back to the lowest MIP level (largest mipmap, half resolution).
		this.fullscreenMaterial = upsamplingMaterial;

		// A + B = C, then D + C = F, etc.
		for(let i = upsamplingMipmaps.length - 1; i >= 0; --i) {

			const mipmap = upsamplingMipmaps[i];
			upsamplingMaterial.setSize(previousBuffer.width, previousBuffer.height);
			upsamplingMaterial.inputBuffer = previousBuffer.texture;
			upsamplingMaterial.supportBuffer = downsamplingMipmaps[i].texture;
			renderer.setRenderTarget(mipmap);
			renderer.render(scene, camera);
			previousBuffer = mipmap;

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.set(width, height);

		let w = resolution.width, h = resolution.height;

		for(let i = 0, l = this.downsamplingMipmaps.length; i < l; ++i) {

			w = Math.round(w * 0.5);
			h = Math.round(h * 0.5);

			this.downsamplingMipmaps[i].setSize(w, h);

			if(i < this.upsamplingMipmaps.length) {

				this.upsamplingMipmaps[i].setSize(w, h);

			}

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(frameBufferType !== undefined) {

			const mipmaps = this.downsamplingMipmaps.concat(this.upsamplingMipmaps);

			for(const mipmap of mipmaps) {

				mipmap.texture.type = frameBufferType;

			}

			if(frameBufferType !== UnsignedByteType) {

				this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			} else if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				for(const mipmap of mipmaps) {

					mipmap.texture.colorSpace = SRGBColorSpace;

				}

			}

		}

	}

	/**
	 * Deletes internal render targets and textures.
	 */

	dispose() {

		super.dispose();

		for(const mipmap of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) {

			mipmap.dispose();

		}

	}

}
