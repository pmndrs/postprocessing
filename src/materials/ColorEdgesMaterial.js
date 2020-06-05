import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/edge-detection/color.frag";
import vertexShader from "./glsl/edge-detection/shader.vert";

/**
 * A material that detects edges in a color texture.
 *
 * @deprecated Use EdgeDetectionMaterial instead.
 */

export class ColorEdgesMaterial extends ShaderMaterial {

	/**
	 * Constructs a new color edges material.
	 *
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({

			type: "ColorEdgesMaterial",

			defines: {
				LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
				EDGE_THRESHOLD: "0.1"
			},

			uniforms: {
				inputBuffer: new Uniform(null),
				texelSize: new Uniform(texelSize)
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
	 * Sets the local contrast adaptation factor.
	 *
	 * If there is a neighbor edge that has _factor_ times bigger contrast than
	 * the current edge, the edge will be discarded.
	 *
	 * This allows to eliminate spurious crossing edges and is based on the fact
	 * that if there is too much contrast in a direction, the perceptual contrast
	 * in the other neighbors will be hidden.
	 *
	 * @param {Number} factor - The local contrast adaptation factor. Default is 2.0.
	 */

	setLocalContrastAdaptationFactor(factor) {

		this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("2");
		this.needsUpdate = true;

	}

	/**
	 * Sets the edge detection sensitivity.
	 *
	 * A lower value results in more edges being detected at the expense of
	 * performance.
	 *
	 * 0.1 is a reasonable value, and allows to catch most visible edges.
	 * 0.05 is a rather overkill value, that allows to catch 'em all.
	 *
	 * If temporal supersampling is used, 0.2 could be a reasonable value, as low
	 * contrast edges are properly filtered by just 2x.
	 *
	 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
	 */

	setEdgeDetectionThreshold(threshold) {

		const t = Math.min(Math.max(threshold, 0.05), 0.5);
		this.defines.EDGE_THRESHOLD = t.toFixed("2");
		this.needsUpdate = true;

	}

}
