import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/pixelation/shader.frag";
import vertex from "./glsl/pixelation/shader.vert";

/**
 * A pixelation shader material.
 *
 * Original shader code by Robert Casanova:
 *  https://github.com/robertcasanova/pixelate-shader
 */

export class PixelationMaterial extends ShaderMaterial {

	/**
	 * Constructs a new pixelation material.
	 */

	constructor() {

		super({

			type: "PixelationMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				granularity: new Uniform(1.0),
				resolution: new Uniform(new Vector2(1.0, 1.0)),
				dx: new Uniform(1.0),
				dy: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

	/**
	 * The pixel granularity.
	 *
	 * @type {Number}
	 */

	get granularity() {

		return this.uniforms.granularity.value;

	}

	/**
	 * A higher value yields coarser visuals.
	 *
	 * @type {Number}
	 */

	set granularity(x) {

		const uniforms = this.uniforms;
		const resolution = uniforms.resolution.value;

		uniforms.granularity.value = x;
		uniforms.dx.value = x / resolution.x;
		uniforms.dy.value = x / resolution.y;

	}

	/**
	 * Sets the resolution.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setResolution(width, height) {

		this.uniforms.resolution.value.set(width, height);
		this.granularity = this.granularity;

	}

}
