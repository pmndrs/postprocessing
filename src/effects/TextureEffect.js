import { Uniform } from "three";
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
	 * @param {Boolean} [options.aspectCorrection=false] - Whether the texture coordinates should be affected by the aspect ratio.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, texture = null, aspectCorrection = false } = {}) {

		super("TextureEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["texture", new Uniform(texture)]
			])

		});

		this.aspectCorrection = aspectCorrection;

	}

	/**
	 * Indicates whether aspect correction is enabled.
	 *
	 * If enabled, the texture can be scaled using the `scale` uniform.
	 *
	 * @type {Boolean}
	 */

	get aspectCorrection() {

		return this.defines.has("ASPECT_CORRECTION");

	}

	/**
	 * Enables or disables aspect correction.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set aspectCorrection(value) {

		if(value) {

			this.defines.set("ASPECT_CORRECTION", "1");
			this.uniforms.set("scale", new Uniform(1.0));
			this.vertexShader = vertexShader;

		} else {

			this.defines.delete("ASPECT_CORRECTION");
			this.uniforms.delete("scale");
			this.vertexShader = null;

		}

	}

}
