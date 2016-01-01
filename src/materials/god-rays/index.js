import shader from "./inlined/shader";
import THREE from "three";

/**
 * Phase enumeration.
 *
 * Generate-phase:
 *  In the first pass, the masked scene is blurred along radial lines towards the light source.
 *  The result of the previous pass is re-blurred twice with a decreased distance between the samples.
 *
 * Combine-phase:
 *  The result is added to the normal scene.
 *
 * @property Phase
 * @type Object
 * @static
 * @final
 */

export var Phase = Object.freeze({
	GENERATE: 0,
	COMBINE: 1
});

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
 * @param {Phase} [phase=Phase.GENERATE] - Determines which shader code to use. See Phase enumeration.
 */

export function GodRaysMaterial(phase) {

	THREE.ShaderMaterial.call(this, {

		defines: {

			NUM_SAMPLES_FLOAT: "6.0",
			NUM_SAMPLES_INT: "6"

		},

		uniforms: (phase === Phase.COMBINE) ? {

			tDiffuse: {type: "t", value: null},
			tGodRays: {type: "t", value: null},
			intensity: {type: "f", value: 0.69},

		} : {

			tDiffuse: {type: "t", value: null},
			stepSize: {type: "f", value: 1.0},
			decay: {type: "f", value: 0.93},
			weight: {type: "f", value: 1.0},
			exposure: {type: "f", value: 1.0},
			lightPosition: {type: "v3", value: null}

		},

		fragmentShader: (phase === Phase.COMBINE) ? shader.fragment.combine : shader.fragment.generate,
		vertexShader: shader.vertex

	});

}

GodRaysMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
GodRaysMaterial.prototype.constructor = GodRaysMaterial;
