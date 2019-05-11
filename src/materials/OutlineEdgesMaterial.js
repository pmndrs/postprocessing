import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/outline-edges/shader.frag";
import vertexShader from "./glsl/outline-edges/shader.vert";

/**
 * An outline edge detection shader material.
 */

export class OutlineEdgesMaterial extends ShaderMaterial {

	/**
	 * Constructs a new outline edge detection material.
	 *
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({

			type: "OutlineEdgesMaterial",

			uniforms: {

				maskTexture: new Uniform(null),
				texelSize: new Uniform(new Vector2())

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

		this.setTexelSize(texelSize.x, texelSize.y);

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
