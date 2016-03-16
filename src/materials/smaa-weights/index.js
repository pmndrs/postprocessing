import shader from "./inlined/shader";
import areaImage from "./area-image";
import searchImage from "./search-image";
import THREE from "three";

/**
 * Subpixel Morphological Antialiasing (SMAA) v2.8
 *
 * Preset: SMAA 1x Medium (with color edge detection).
 *  https://github.com/iryoku/smaa/releases/tag/v2.8
 *
 * @class SMAAWeightsMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class SMAAWeightsMaterial extends THREE.ShaderMaterial {

	constructor(texelSize) {

		super({

			defines: {

				SMAA_MAX_SEARCH_STEPS_INT: "8",
				SMAA_MAX_SEARCH_STEPS_FLOAT: "8.0",

				SMAA_AREATEX_MAX_DISTANCE: "16.0",

				SMAA_AREATEX_PIXEL_SIZE: "(1.0 / vec2(160.0, 560.0))",
				SMAA_AREATEX_SUBTEX_SIZE: "(1.0 / 7.0)"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				tArea: {type: "t", value: null},
				tSearch: {type: "t", value: null},
				texelSize: {type: "v2", value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

			},

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex

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
