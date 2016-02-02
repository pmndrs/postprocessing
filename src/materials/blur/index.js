import shader from "./inlined/shader";
import THREE from "three";

/**
 * An enumeration of blur directions.
 *
 * @property BlurDirection
 * @type Object
 * @static
 * @final
 */

export var BlurDirection = Object.freeze({
	HORIZONTAL: 0,
	VERTICAL: 1
});

/**
 * A blur shader material.
 *
 * http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader
 *
 * @class BlurMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {BlurDirection} direction - The blur direction.
 */

export function BlurMaterial(direction) {

	THREE.ShaderMaterial.call(this, {

		uniforms: {

			tDiffuse: {type: "t", value: null},
			strength: {type: "f", value: 0.0},

		},

		fragmentShader: shader.fragment,
		vertexShader: shader.vertex,

	});

	if(direction === BlurDirection.HORIZONTAL) { this.defines.HORIZONTAL = "1"; }

}

BlurMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype);
BlurMaterial.prototype.constructor = BlurMaterial;
