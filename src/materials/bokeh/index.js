import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Depth of Field shader (Bokeh).
 *
 * Original shader code by Martins Upitis:
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

		if(options.focus !== undefined) { options.focus = 1.0; }
		if(options.aperture !== undefined) { options.aperture = 0.025; }
		if(options.maxBlur !== undefined) { options.maxBlur = 1.0; }

		super({

			type: "BokehMaterial",

			uniforms: {

				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000),
				aspect: new Uniform(1.0),

				tDiffuse: new Uniform(null),
				tDepth: new Uniform(null),

				focus: new Uniform(options.focus),
				aperture: new Uniform(options.aperture),
				maxBlur: new Uniform(options.maxBlur)

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
