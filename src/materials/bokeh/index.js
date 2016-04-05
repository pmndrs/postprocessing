import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Depth of Field shader (Bokeh).
 *
 * Original code by Martins Upitis:
 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 *
 * @class BokehMaterial
 * @constructor
 * @extends ShaderMaterial
 * @param {Object} [options] - The options.
 * @param {Number} [options.focus=1.0] - Focus distance.
 * @param {Number} [options.aspect=1.0] - Camera aspect factor.
 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
 */

export class BokehMaterial extends THREE.ShaderMaterial {

	constructor(options) {

		if(options === undefined) { options = {}; }

		super({

			uniforms: {

				tDiffuse: {type: "t", value: null},
				tDepth: {type: "t", value: null},

				focus: {type: "f", value: (options.focus !== undefined) ? options.focus : 1.0},
				aspect: {type: "f", value: (options.aspect !== undefined) ? options.aspect : 1.0},
				aperture: {type: "f", value: (options.aperture !== undefined) ? options.aperture : 0.025},
				maxBlur: {type: "f", value: (options.maxBlur !== undefined) ? options.maxBlur : 1.0}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
