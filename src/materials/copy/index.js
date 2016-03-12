import shader from "./inlined/shader";
import THREE from "three";

/**
 * A simple copy shader material.
 *
 * @class CopyMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export class CopyMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			uniforms: {

				tDiffuse: {type: "t", value: null},
				opacity: {type: "f", value: 1.0}

			},

			fragmentShader: shader.fragment,
			vertexShader: shader.vertex

		});

	}

}
