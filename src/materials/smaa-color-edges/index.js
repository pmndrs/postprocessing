import shader from "./inlined/shader";
import THREE from "three";

/**
 * Subpixel Morphological Antialiasing (SMAA) v2.8
 *
 * Preset: SMAA 1x Medium (with color edge detection).
 *  https://github.com/iryoku/smaa/releases/tag/v2.8
 *
 * @class SMAAColorEdgesMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class SMAAColorEdgesMaterial extends THREE.ShaderMaterial {

	constructor(texelSize) {

		super({

			defines: {

				EDGE_THRESHOLD: "0.1"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				texelSize: {type: "v2", value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

			},

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex

		});

	}

}
