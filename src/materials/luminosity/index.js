import shader from "./inlined/shader";
import THREE from "three";

/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map. 
 * It can also be configured to output colors that are scaled with their 
 * respective luminance value. Additionally, a range may be provided to 
 * mask out undesired texels.
 *
 * The alpha channel will remain unaffected in all cases.
 *
 * @class LuminosityMaterial
 * @constructor
 * @extends ShaderMaterial
 * @params {Boolean} [color=false] - Defines whether the shader should output colors scaled with their luminance value.
 * @params {Vector2} [range] - If provided, the shader will mask out texels that aren't in the specified range.
 */

export function LuminosityMaterial(color, range) {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null},
			distinction: {type: "f", value: 1.0},
			range: {type: "v2", value: (range !== undefined) ? range : new THREE.Vector2()}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

	if(color !== undefined) { this.defines.COLOR = "1"; }
	if(range !== undefined) { this.defines.RANGE = "1"; }

}

LuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
LuminosityMaterial.prototype.constructor = LuminosityMaterial;
