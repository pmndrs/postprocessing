import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/lens-flare-features.frag";
import vertexShader from "./glsl/lens-flare-features.vert";

/**
 * A lens flare features material.
 *
 * @implements {Resizable}
 */

export class LensFlareFeaturesMaterial extends ShaderMaterial {

	/**
	 * Constructs a new lens flare features material.
	 */

	constructor() {

		super({
			name: "LensFlareFeaturesMaterial",
			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(new Vector2()),
				ghostAmount: new Uniform(0.001),
				haloAmount: new Uniform(0.001),
				chromaticAberration: new Uniform(10)
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
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

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

	/**
	 * The amount of ghosts.
	 *
	 * @type {Number}
	 */

	get ghostAmount() {

		return this.uniforms.ghostAmount.value;

	}

	set ghostAmount(value) {

		this.uniforms.ghostAmount.value = value;

	}

	/**
	 * The amount of halos.
	 *
	 * @type {Number}
	 */

	get haloAmount() {

		return this.uniforms.haloAmount.value;

	}

	set haloAmount(value) {

		this.uniforms.haloAmount.value = value;

	}


	/**
	 * The offset of chromatic aberration.
	 *
	 * @type {Number}
	 */

	get chromaticAberration() {

		return this.uniforms.chromaticAberration.value;

	}

	set chromaticAberration(value) {

		this.uniforms.chromaticAberration.value = value;

	}

}
