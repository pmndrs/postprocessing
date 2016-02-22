import shader from "./inlined/shader";
import THREE from "three";

/**
 * An adaptive luminosity shader material.
 *
 * @class AdaptiveLuminosityMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function AdaptiveLuminosityMaterial() {

	THREE.ShaderMaterial.call(this, {

		defines: {

			MIP_LEVEL_1X1: 0.0

		},

		uniforms: {

			lastLum: {type: "t", value: null},
			currentLum: {type: "t", value: null},
			delta: {type: "f", value: 0.016},
			tau: {type: "f", value: 1.0}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

}

AdaptiveLuminosityMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
AdaptiveLuminosityMaterial.prototype.constructor = AdaptiveLuminosityMaterial;
