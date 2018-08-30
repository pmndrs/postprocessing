import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/texture/shader.frag";
import vertex from "./glsl/texture/shader.vert";

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
	 * @param {Number} [options.scale=1.0] - The texture scale. Has no effect if aspect correction is disabled.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			texture: null,
			aspectCorrection: false,
			scale: 1.0
		}, options);

		super("TextureEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["texture", new Uniform(settings.texture)]
			])

		});

		if(settings.aspectCorrection) {

			this.defines.set("ASPECT_CORRECTION", "1");
			this.uniforms.set("scale", new Uniform(settings.scale));
			this.vertexShader = vertex;

		}

	}

}
