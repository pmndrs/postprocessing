import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/downsampling/shader.frag";
import vertexShader from "./glsl/downsampling/shader.vert";

/**
 * A downsampling shader material for depth and normal textures.
 *
 * Based on an article by Eleni Maria Stea:
 * https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
 */

export class DownsamplingMaterial extends ShaderMaterial {

	/**
	 * Constructs a new downsampling material.
	 */

	constructor() {

		super({

			type: "DownsamplingMaterial",

			defines: {
				DEPTH_PACKING: "0"
			},

			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

		/** @ignore */
		this.toneMapped = false;

	}

	/**
	 * The depth packing of the source depth buffer.
	 *
	 * @type {Number}
	 */

	get depthPacking() {

		return Number(this.defines.DEPTH_PACKING);

	}

	/**
	 * Sets the depth packing.
	 *
	 * @type {Number}
	 */

	set depthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the texel size.
	 *
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

	}

}
