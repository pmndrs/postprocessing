import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { Resizable } from "../core/Resizable.js";

import fragmentShader from "./shaders/depth-downsampling.frag";
import vertexShader from "./shaders/depth-downsampling.vert";

/**
 * A depth downsampling shader material.
 *
 * Based on an article by Eleni Maria Stea.
 * @see https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
 * @group Materials
 */

export class DepthDownsamplingMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new depth downsampling material.
	 */

	constructor() {

		super({
			name: "DepthDownsamplingMaterial",
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The normal buffer.
	 */

	set normalBuffer(value: Texture | null) {

		this.uniforms.normalBuffer.value = value;

		if(value !== null) {

			this.defines.DOWNSAMPLE_NORMALS = "1";

		} else {

			delete this.defines.DOWNSAMPLE_NORMALS;

		}

		this.needsUpdate = true;

	}

	setSize(width: number, height: number): void {

		const texelSize = this.uniforms.texelSize.value as Vector2;
		texelSize.set(1.0 / width, 1.0 / height);

	}

}
