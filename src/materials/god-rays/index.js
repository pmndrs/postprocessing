import shader from "./inlined/shader";
import THREE from "three";

/**
 * A crepuscular rays shader material.
 *
 * References:
 *
 * Nvidia, GPU Gems 3 - Chapter 13:
 *  Volumetric Light Scattering as a Post-Process
 *  http://http.developer.nvidia.com/GPUGems3/gpugems3_ch13.html
 *
 * Crytek, Sousa - GDC2008:
 *  Crysis Next Gen Effects
 *  http://www.crytek.com/sites/default/files/GDC08_SousaT_CrysisEffects.ppt
 *
 * @class GodRaysMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export function GodRaysMaterial() {

	THREE.ShaderMaterial.call(this, {

		defines: {

			NUM_SAMPLES_FLOAT: "6.0",
			NUM_SAMPLES_INT: "6"

		},

		uniforms: {

			tDiffuse: {type: "t", value: null},
			stepSize: {type: "f", value: 1.5},
			decay: {type: "f", value: 1.0},
			weight: {type: "f", value: 1.0},
			exposure: {type: "f", value: 1.0},
			lightPosition: {type: "v3", value: null}

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex

	});

}

GodRaysMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
GodRaysMaterial.prototype.constructor = GodRaysMaterial;
