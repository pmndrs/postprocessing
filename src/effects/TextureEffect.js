import { Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../enums/ColorChannel.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/texture.frag";
import vertexShader from "./glsl/texture.vert";

/**
 * A texture effect.
 */

export class TextureEffect extends Effect {

	/**
	 * Constructs a new texture effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Texture} [options.texture] - A texture.
	 * @param {Boolean} [options.aspectCorrection=false] - Deprecated. Adjust the texture's offset, repeat and center instead.
	 */

	constructor({ blendFunction, texture = null, aspectCorrection = false } = {}) {

		super("TextureEffect", fragmentShader, {
			blendFunction,
			defines: new Map([
				["TEXEL", "texel"]
			]),
			uniforms: new Map([
				["map", new Uniform(null)],
				["scale", new Uniform(1.0)],
				["uvTransform", new Uniform(null)]
			])
		});

		this.texture = texture;
		this.aspectCorrection = aspectCorrection;

	}

	/**
	 * The texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.uniforms.get("map").value;

	}

	set texture(value) {

		const prevTexture = this.texture;
		const uniforms = this.uniforms;
		const defines = this.defines;

		if(prevTexture !== value) {

			uniforms.get("map").value = value;
			uniforms.get("uvTransform").value = value.matrix;
			defines.delete("TEXTURE_PRECISION_HIGH");

			if(value !== null) {

				if(value.matrixAutoUpdate) {

					defines.set("UV_TRANSFORM", "1");
					this.setVertexShader(vertexShader);

				} else {

					defines.delete("UV_TRANSFORM");
					this.setVertexShader(null);

				}

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
	 * Returns the texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.texture;

	}

	/**
	 * Sets the texture.
	 *
	 * @deprecated Use texture instead.
	 * @param {Texture} value - The texture.
	 */

	setTexture(value) {

		this.texture = value;

	}

	/**
	 * Indicates whether aspect correction is enabled.
	 *
	 * @type {Number}
	 * @deprecated Adjust the texture's offset, repeat, rotation and center instead.
	 */

	get aspectCorrection() {

		return this.defines.has("ASPECT_CORRECTION");

	}

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

		const texture = this.texture;
		return (texture !== null && texture.matrixAutoUpdate);

	}

	set uvTransform(value) {

		const texture = this.texture;

		if(texture !== null) {

			texture.matrixAutoUpdate = value;

		}

	}

	/**
	 * Sets the swizzles that will be applied to the components of a texel before it is written to the output color.
	 *
	 * @param {ColorChannel} r - The swizzle for the `r` component.
	 * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
	 * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
	 * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
	 */

	setTextureSwizzleRGBA(r, g = r, b = r, a = r) {

		const rgba = "rgba";
		let swizzle = "";

		if(r !== ColorChannel.RED || g !== ColorChannel.GREEN || b !== ColorChannel.BLUE || a !== ColorChannel.ALPHA) {

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

		if(this.texture.matrixAutoUpdate) {

			this.texture.updateMatrix();

		}

	}

}
