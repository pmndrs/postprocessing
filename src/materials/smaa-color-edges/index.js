import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material detects edges in a color texture.
 *
 * @class SMAAColorEdgesMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class SMAAColorEdgesMaterial extends THREE.ShaderMaterial {

	constructor(texelSize) {

		super({

			type: "SMAAColorEdgesMaterial",

			defines: {

				EDGE_THRESHOLD: "0.1"

			},

			uniforms: {

				tDiffuse: {type: "t", value: null},
				texelSize: {type: "v2", value: (texelSize !== undefined) ? texelSize : new THREE.Vector2()}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
