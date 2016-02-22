import shader from "./inlined/shader";
import THREE from "three";

/**
 * A simple copy shader material.
 *
 * @class CopyMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function CopyMaterial() {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null},
			opacity: {type: "f", value: 1.0}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

}

CopyMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
CopyMaterial.prototype.constructor = CopyMaterial;
