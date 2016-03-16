import shader from "./inlined/shader";
import THREE from "three";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material detects edges in a color texture.
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
