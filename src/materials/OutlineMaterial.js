import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/outline.frag";
import vertexShader from "./glsl/outline.vert";

/**
 * An outline shader material.
 *
 * @implements {Resizable}
 */

export class OutlineMaterial extends ShaderMaterial {

	/**
	 * Constructs a new outline material.
	 *
	 * TODO Remove texelSize param.
	 * @param {Vector2} [texelSize] - The screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({
			name: "OutlineMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.uniforms.texelSize.value.set(texelSize.x, texelSize.y);

		// TODO Added for backward-compatibility.
		this.uniforms.maskTexture = this.uniforms.inputBuffer;

	}

	/**
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the texel size.
	 *
	 * @deprecated Use setSize() instead.
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.uniforms.texelSize.value.set(1.0 / width, 1.0 / height);

	}

}
