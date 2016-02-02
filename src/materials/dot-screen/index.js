import shader from "./inlined/shader";
import THREE from "three";

/**
 * A dot screen shader material.
 *
 * @class DotScreenMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function DotScreenMaterial() {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null},

			angle: {type: "f", value: 1.57},
			scale: {type: "f", value: 1.0},

			offsetRepeat: {type: "v4", value: new THREE.Vector4(0.5, 0.5, 1.0, 1.0)}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex,

	});

}

DotScreenMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
DotScreenMaterial.prototype.constructor = DotScreenMaterial;
