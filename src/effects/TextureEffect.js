import { Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../core/ColorChannel";
import { getTextureDecoding } from "../utils/getTextureDecoding";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/texture/shader.frag";
import vertexShader from "./glsl/texture/shader.vert";

/**
 * A texture effect.
 */

export class TextureEffect extends Effect {

	/**
	 * Constructs a new texture effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Texture} [options.texture] - A texture.
	 * @param {Boolean} [options.aspectCorrection=false] - Deprecated. Adjust the texture's offset, repeat and center instead.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		texture = null,
		aspectCorrection = false
	} = {}) {

		super("TextureEffect", fragmentShader, {
			blendFunction,
			vertexShader,
			defines: new Map([
				["TEXEL", "texel"]
			]),
			uniforms: new Map([
				["map", new Uniform(null)],
				["scale", new Uniform(1.0)],
				["uvTransform", new Uniform(null)]
			])
		});

		this.setTexture(texture);
		this.aspectCorrection = aspectCorrection;

		/**
		 * Indicates whether the context is WebGL 2.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.isWebGL2 = false;

	}

	/**
	 * The texture.
	 *
	 * @type {Texture}
	 * @deprecated Use getTexture() instead.
	 */

	get texture() {

		return this.getTexture();

	}

	/**
	 * Sets the texture.
	 *
	 * @type {Texture}
	 * @deprecated Use setTexture() instead.
	 */

	set texture(value) {

		this.setTexture(value);

	}

	/**
	 * Returns the texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.uniforms.get("map").value;

	}

	/**
	 * Sets the texture.
	 *
	 * @param {Texture} value - The texture.
	 */

	setTexture(value) {

		const prevTexture = this.getTexture();
		const defines = this.defines;

		if(prevTexture !== value) {

			this.uniforms.get("map").value = value;
			this.uniforms.get("uvTransform").value = value.matrix;
			defines.delete("TEXTURE_PRECISION_HIGH");

			const decoding = getTextureDecoding(value, this.renderer.capabilities.isWebGL2);
			defines.set("texelToLinear(texel)", decoding);

			if(value !== null) {

				if(value.type !== UnsignedByteType) {

					defines.set("TEXTURE_PRECISION_HIGH", "1");

				}

				if(prevTexture === null || prevTexture.type !== value.type || prevTexture.encoding !== value.encoding) {

					this.setChanged();

				}

			}

		}

	}

	/**
	 * Indicates whether aspect correction is enabled.
	 *
	 * If enabled, the texture can be scaled using the `scale` uniform.
	 *
	 * @type {Number}
	 * @deprecated Adjust the texture's offset, repeat and center instead.
	 */

	get aspectCorrection() {

		return this.defines.has("ASPECT_CORRECTION");

	}

	/**
	 * Enables or disables aspect correction.
	 *
	 * @type {Number}
	 * @deprecated Adjust the texture's offset, repeat and center instead.
	 */

	set aspectCorrection(value) {

		if(this.aspectCorrection !== value) {

			if(value) {

				this.defines.set("ASPECT_CORRECTION", "1");

			} else {

				this.defines.delete("ASPECT_CORRECTION");

			}

			this.setChanged();

		}

	}

	/**
	 * Indicates whether the texture UV coordinates will be transformed using the transformation matrix of the texture.
	 *
	 * @type {Boolean}
	 * @deprecated Use texture.matrixAutoUpdate instead.
	 */

	get uvTransform() {

		const texture = this.getTexture();
		return (texture !== null && texture.matrixAutoUpdate);

	}

	/**
	 * Enables or disables texture UV transformation.
	 *
	 * @type {Boolean}
	 * @deprecated Set texture.matrixAutoUpdate instead.
	 */

	set uvTransform(value) {

		const texture = this.getTexture();

		if(texture !== null) {

			texture.matrixAutoUpdate = value;

		}

	}

	/**
	 * Sets the swizzles that will be applied to the `r`, `g`, `b`, and `a`
	 * components of a texel before it is written to the output color.
	 *
	 * @param {ColorChannel} r - The swizzle for the `r` component.
	 * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
	 * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
	 * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
	 */

	setTextureSwizzleRGBA(r, g = r, b = r, a = r) {

		const rgba = "rgba";
		let swizzle = "";

		if(r !== ColorChannel.RED || g !== ColorChannel.GREEN ||
			b !== ColorChannel.BLUE || a !== ColorChannel.ALPHA) {

			swizzle = [".", rgba[r], rgba[g], rgba[b], rgba[a]].join("");

		}

		this.defines.set("TEXEL", "texel" + swizzle);
		this.setChanged();

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const texture = this.uniforms.get("map").value;

		if(texture.matrixAutoUpdate) {

			texture.updateMatrix();

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

		this.isWebGL2 = renderer.capabilities.isWebGL2;
		const decoding = getTextureDecoding(this.texture, this.isWebGL2);
		this.defines.set("texelToLinear(texel)", decoding);

	}

}
