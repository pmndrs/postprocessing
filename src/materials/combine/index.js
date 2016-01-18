import shader from "./inlined/shader";
import THREE from "three";

/**
 * A material for combining two textures.
 *
 * @class CombineMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {Boolean} [invertTexture1=false] - Invert the first texture's rgb values.
 * @param {Boolean} [invertTexture2=false] - Invert the second texture's rgb values.
 */

export function CombineMaterial(invertTexture1, invertTexture2) {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			texture1: {type: "t", value: null},
			texture2: {type: "t", value: null},

			opacity1: {type: "f", value: 1.0},
			opacity2: {type: "f", value: 1.0}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

	if(invertTexture1) { this.defines.INVERT_TEX1 = "1"; }
	if(invertTexture2) { this.defines.INVERT_TEX2 = "1"; }

}

CombineMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
CombineMaterial.prototype.constructor = CombineMaterial;
