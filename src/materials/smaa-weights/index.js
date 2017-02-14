import { ShaderMaterial, Uniform, Vector2 } from "three";

import areaImage from "./area-image.js";
import searchImage from "./search-image.js";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material computes weights for detected edges.
 *
 * @class SMAAWeightsMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class SMAAWeightsMaterial extends ShaderMaterial {

	constructor(texelSize = new Vector2()) {

		super({

			type: "SMAAWeightsMaterial",

			defines: {

				SMAA_MAX_SEARCH_STEPS_INT: "8",
				SMAA_MAX_SEARCH_STEPS_FLOAT: "8.0",

				SMAA_AREATEX_MAX_DISTANCE: "16.0",

				SMAA_AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
				SMAA_AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)"

			},

			uniforms: {

				tDiffuse: new Uniform(null),
				tArea: new Uniform(null),
				tSearch: new Uniform(null),
				texelSize: new Uniform(texelSize)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		/**
		 * The area pattern recognition image.
		 *
		 * @property areaImage
		 * @type String
		 */

		this.areaImage = areaImage;

		/**
		 * The search image.
		 *
		 * @property searchImage
		 * @type String
		 */

		this.searchImage = searchImage;

	}

}
