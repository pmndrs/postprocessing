import { Color, ShaderMaterial, Uniform } from "three";

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
	 * @param {Number} [options.visibleEdgeColor=0xffffff] - The color of visible edges.
	 * @param {Number} [options.hiddenEdgeColor=0x22090A] - The color of hidden edges.
	 * @param {Boolean} [alphaBlending=false] - Whether the outline should be blended using alpha.
	 * @param {Boolean} [xRay=true] - Whether hidden parts of selected objects should be visible.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			edgeStrength: 1.0,
			patternScale: 1.0,
			visibleEdgeColor: 0xffffff,
			hiddenEdgeColor: 0x22090A,
			alphaBlending: false,
			xRay: true
		}, options);

		super({

			type: "OutlineBlendMaterial",

			uniforms: {

				pulse: new Uniform(1.0),
				aspect: new Uniform(1.0),

				tDiffuse: new Uniform(null),
				tMask: new Uniform(null),
				tOutline: new Uniform(null),
				tPattern: new Uniform(null),

				edgeStrength: new Uniform(settings.edgeStrength),
				patternScale: new Uniform(settings.patternScale),

				visibleEdgeColor: new Uniform(new Color(settings.visibleEdgeColor)),
				hiddenEdgeColor: new Uniform(new Color(settings.hiddenEdgeColor))

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setAlphaBlendingEnabled(settings.alphaBlending);
		this.setXRayEnabled(settings.xRay);

	}

	/**
	 * Enables or disables the alpha blending.
	 *
	 * @param {Boolean} enabled - Whether the alpha blending should be enabled.
	 */

	setAlphaBlendingEnabled(enabled) {

		if(enabled) {

			this.defines.ALPHA_BLENDING = "1";

		} else {

			delete this.defines.ALPHA_BLENDING;

		}

		this.needsUpdate = true;

	}

	/**
	 * Defines whether hidden parts of selected objects should be visible.
	 *
	 * @param {Boolean} enabled - Whether hidden parts of selected objects should be visible.
	 */

	setXRayEnabled(enabled) {

		if(enabled) {

			this.defines.X_RAY = "1";

		} else {

			delete this.defines.X_RAY;

		}

		this.needsUpdate = true;

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
