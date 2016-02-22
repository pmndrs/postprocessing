import shader from "./inlined/shader";
import THREE from "three";

/**
 * A luminosity shader material.
 * http://en.wikipedia.org/wiki/Luminosity
 *
 * @class LuminosityMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function LuminosityMaterial() {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

}

LuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
LuminosityMaterial.prototype.constructor = LuminosityMaterial;
