import { ShaderMaterial } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Depth of Field shader (Bokeh).
 *
 * Original code by Martins Upitis:
 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 *
 * @class BokehMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {PerspectiveCamera} [camera] - A camera.
 * @param {Object} [options] - The options.
 * @param {Number} [options.focus=1.0] - Focus distance.
 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
 */

export class BokehMaterial extends ShaderMaterial {

	constructor(camera = null, options = {}) {

		super({

			type: "BokehMaterial",

			uniforms: {

				cameraNear: { value: 0.1 },
				cameraFar: { value: 2000 },
				aspect: { value: 1.0 },

				tDiffuse: { value: null },
				tDepth: { value: null },

				focus: { value: (options.focus !== undefined) ? options.focus : 1.0 },
				aperture: { value: (options.aperture !== undefined) ? options.aperture : 0.025 },
				maxBlur: { value: (options.maxBlur !== undefined) ? options.maxBlur : 1.0 }

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(camera !== null) { this.adoptCameraSettings(camera); }

	}

	/**
	 * Adopts the settings of the given camera.
	 *
	 * @method adoptCameraSettings
	 * @param {PerspectiveCamera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		this.uniforms.cameraNear.value = camera.near;
		this.uniforms.cameraFar.value = camera.far;
		this.uniforms.aspect.value = camera.aspect;

	}

}
