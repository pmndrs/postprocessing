import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/outline-blend/shader.frag";
import vertex from "./glsl/outline-blend/shader.vert";

/**
 * An outline blend shader material.
 */

export class OutlineBlendMaterial extends ShaderMaterial {

	/**
	 * Constructs a new outline blend material.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.edgeStrength=1.0] - The edge strength.
	 * @param {Number} [options.patternScale=1.0] - The scale of the pattern texture.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			edgeStrength: 1.0,
			patternScale: 1.0
		}, options);

		super({

			type: "OutlineBlendMaterial",

			uniforms: {

				time: new Uniform(0.0),
				aspect: new Uniform(1.0),

				tDiffuse: new Uniform(null),
				tMask: new Uniform(null),
				tEdges: new Uniform(null),
				tPattern: new Uniform(null),

				edgeStrength: new Uniform(settings.edgeStrength),
				patternScale: new Uniform(settings.patternScale)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

	/**
	 * Sets a pattern texture to use as overlay.
	 *
	 * @param {Texture} [texture=null] - A pattern texture. Set to null to disable the pattern.
	 */

	setPatternTexture(texture = null) {

		if(texture !== null) {

			this.defines.USE_PATTERN = "1";

		} else {

			delete this.defines.USE_PATTERN;

		}

		this.uniforms.tPattern.value = texture;
		this.needsUpdate = true;

	}

}
