import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShaderDepth from "./glsl/edge-detection/depth.frag";
import fragmentShaderLuma from "./glsl/edge-detection/luma.frag";
import fragmentShaderColor from "./glsl/edge-detection/color.frag";
import vertexShader from "./glsl/edge-detection/shader.vert";

/**
 * An edge detection material.
 *
 * Mainly used for Subpixel Morphological Antialiasing.
 */

export class EdgeDetectionMaterial extends ShaderMaterial {

	/**
	 * Constructs a new edge detection material.
	 *
	 * @param {Vector2} [texelSize] - The screen texel size.
	 * @param {EdgeDetectionMode} [edgeDetectionMode] - The edge detection mode.
	 * @todo Remove texelSize parameter.
	 */

	constructor(texelSize = new Vector2(), edgeDetectionMode) {

		super({

			type: "EdgeDetectionMaterial",

			defines: {
				LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
				EDGE_THRESHOLD: "0.1",
				DEPTH_THRESHOLD: "0.01"
			},

			uniforms: {
				texelSize: new Uniform(texelSize)
			},

			vertexShader,
			toneMapped: false,
			depthWrite: false,
			depthTest: false

		});

		this.setEdgeDetectionMode(edgeDetectionMode);

	}

	/**
	 * Sets the edge detection mode.
	 *
	 * @private
	 * @param {EdgeDetectionMode} mode - The edge detection mode.
	 */

	setEdgeDetectionMode(mode) {

		this.defines.EDGE_DETECTION_MODE = mode.toFixed(0);

		switch(mode) {

			case EdgeDetectionMode.DEPTH:
				this.fragmentShader = fragmentShaderDepth;
				this.uniforms.depthBuffer = new Uniform(null);
				break;

			case EdgeDetectionMode.LUMA:
				this.fragmentShader = fragmentShaderLuma;
				this.uniforms.inputBuffer = new Uniform(null);
				break;

			case EdgeDetectionMode.COLOR:
			default:
				this.fragmentShader = fragmentShaderColor;
				this.uniforms.inputBuffer = new Uniform(null);
				break;

		}

	}

	/**
	 * Sets the local contrast adaptation factor. Has no effect if the edge
	 * detection mode is set to DEPTH.
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

		threshold = Math.min(Math.max(threshold, 0.05), 0.5);

		this.defines.EDGE_THRESHOLD = threshold.toFixed("2");
		this.defines.DEPTH_THRESHOLD = (threshold * 0.1).toFixed("3");
		this.needsUpdate = true;

	}

}

/**
 * An enumeration of edge detection modes.
 *
 * @type {Object}
 * @property {Number} DEPTH - Depth-based edge detection.
 * @property {Number} LUMA - Luminance-based edge detection.
 * @property {Number} COLOR - Chroma-based edge detection.
 */

export const EdgeDetectionMode = {

	DEPTH: 0,
	LUMA: 1,
	COLOR: 2

};
