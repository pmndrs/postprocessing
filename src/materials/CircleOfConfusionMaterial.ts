import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/circle-of-confusion.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A circle of confusion shader material.
 *
 * @category Materials
 */

export class CircleOfConfusionMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new circle of confusion material.
	 */

	constructor() {

		super({
			name: "CircleOfConfusionMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				depthBuffer: new Uniform(null),
				focusDistance: new Uniform(0.0),
				focusRange: new Uniform(0.0)
			}
		});

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The focus distance in world units.
	 */

	get focusDistance(): number {

		return this.uniforms.focusDistance.value as number;

	}

	set focusDistance(value: number) {

		this.uniforms.focusDistance.value = value;

	}

	/**
	 * The focus range in world units.
	 */

	get focusRange(): number {

		return this.uniforms.focusRange.value as number;

	}

	set focusRange(value: number) {

		this.uniforms.focusRange.value = value;

	}

}
