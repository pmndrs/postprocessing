import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/bokeh/shader.frag";
import vertex from "./glsl/bokeh/shader.vert";

/**
 * Depth of Field shader (Bokeh).
 *
 * Original shader code by Martins Upitis:
 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

export class BokehMaterial extends ShaderMaterial {

	/**
	 * Constructs a new bokeh material.
	 *
	 * @param {PerspectiveCamera} [camera] - A camera.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.focus=1.0] - The focus distance, corresponds directly with the scene depth.
	 * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focus point that still appears sharp.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
	 */

	constructor(camera, options = {}) {

		const settings = Object.assign({
			focus: 1.0,
			dof: 0.02,
			aperture: 0.025,
			maxBlur: 1.0
		}, options);

		super({

			type: "BokehMaterial",

			uniforms: {

				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000),
				aspect: new Uniform(1.0),

				tDiffuse: new Uniform(null),
				tDepth: new Uniform(null),

				focus: new Uniform(settings.focus),
				dof: new Uniform(settings.dof),
				aperture: new Uniform(settings.aperture),
				maxBlur: new Uniform(settings.maxBlur)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.adoptCameraSettings(camera);

	}

	/**
	 * Adopts the settings of the given camera.
	 *
	 * @param {PerspectiveCamera} [camera=null] - A camera.
	 */

	adoptCameraSettings(camera = null) {

		if(camera !== null) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;
			this.uniforms.aspect.value = camera.aspect;

		}

	}

}
