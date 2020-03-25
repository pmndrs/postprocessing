import { LinearEncoding, Matrix3, sRGBEncoding, Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

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
	 * @param {Boolean} [options.aspectCorrection=false] - Deprecated. Enable uvTransform instead and adjust the texture's offset, repeat and center.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, texture = null, aspectCorrection = false } = {}) {

		super("TextureEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["texture", new Uniform(null)]
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

		return this.uniforms.get("texture").value;

	}

	/**
	 * Sets the texture.
	 *
	 * You'll need to call {@link EffectPass#recompile} if you switch to a texture
	 * that uses a different encoding.
	 *
	 * @type {Texture}
	 */

	set texture(value) {

		this.uniforms.get("texture").value = value;

		if(value !== null) {

			if(value.encoding === sRGBEncoding) {

				this.defines.set("texelToLinear(texel)", "sRGBToLinear(texel)");

			} else if(value.encoding === LinearEncoding) {

				this.defines.set("texelToLinear(texel)", "texel");

			} else {

				console.log("unsupported encoding: " + value.encoding);

			}

		}

	}

	/**
	 * Indicates whether aspect correction is enabled.
	 *
	 * If enabled, the texture can be scaled using the `scale` uniform.
	 *
	 * @type {Number}
	 * @deprecated Use uvTransform instead for full control over the texture coordinates.
	 */

	get aspectCorrection() {

		return this.defines.has("ASPECT_CORRECTION");

	}

	/**
	 * Enables or disables aspect correction.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 * @deprecated Use uvTransform instead for full control over the texture coordinates.
	 */

	set aspectCorrection(value) {

		if(value) {

			if(this.uvTransform) {

				this.uvTransform = false;

			}

			this.defines.set("ASPECT_CORRECTION", "1");
			this.uniforms.set("scale", new Uniform(1.0));
			this.vertexShader = vertexShader;

		} else {

			this.defines.delete("ASPECT_CORRECTION");
			this.uniforms.delete("scale");
			this.vertexShader = null;

		}

	}

	/**
	 * Indicates whether the texture UV coordinates will be transformed using the
	 * transformation matrix of the texture.
	 *
	 * Cannot be used if aspect correction is enabled.
	 *
	 * @type {Boolean}
	 */

	get uvTransform() {

		return this.defines.has("UV_TRANSFORM");

	}

	/**
	 * Enables or disables texture UV transformation.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set uvTransform(value) {

		if(value) {

			if(this.aspectCorrection) {

				this.aspectCorrection = false;

			}

			this.defines.set("UV_TRANSFORM", "1");
			this.uniforms.set("uvTransform", new Uniform(new Matrix3()));
			this.vertexShader = vertexShader;

		} else {

			this.defines.delete("UV_TRANSFORM");
			this.uniforms.delete("uvTransform");
			this.vertexShader = null;

		}

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const texture = this.uniforms.get("texture").value;

		if(this.uvTransform && texture.matrixAutoUpdate) {

			texture.updateMatrix();
			this.uniforms.get("uvTransform").value.copy(texture.matrix);

		}

	}

}
