import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/edge-detection/shader.frag";
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
	 * @param {EdgeDetectionMode} [mode=EdgeDetectionMode.COLOR] - The edge detection mode.
	 * @todo Remove texelSize parameter.
	 */

	constructor(texelSize = new Vector2(), mode = EdgeDetectionMode.COLOR) {

		super({

			type: "EdgeDetectionMaterial",

			defines: {
				LOCAL_CONTRAST_ADAPTATION_FACTOR: "2.0",
				EDGE_THRESHOLD: "0.1",
				DEPTH_THRESHOLD: "0.01",
				PREDICATION_MODE: "0",
				PREDICATION_THRESHOLD: "0.01",
				PREDICATION_SCALE: "2.0",
				PREDICATION_STRENGTH: "1.0",
				DEPTH_PACKING: "0"
			},

			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				predicationBuffer: new Uniform(null),
				texelSize: new Uniform(texelSize)
			},

			fragmentShader,
			vertexShader,

			blending: NoBlending,
			depthWrite: false,
			depthTest: false

		});

		/** @ignore */
		this.toneMapped = false;

		this.setEdgeDetectionMode(mode);

	}

	/**
	 * The current depth packing.
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
	 * Sets the edge detection mode.
	 *
	 * @param {EdgeDetectionMode} mode - The edge detection mode.
	 */

	setEdgeDetectionMode(mode) {

		this.defines.EDGE_DETECTION_MODE = mode.toFixed(0);
		this.needsUpdate = true;

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

		this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Sets the edge detection sensitivity.
	 *
	 * A lower value results in more edges being detected at the expense of
	 * performance.
	 *
	 * For luma- and chroma-based edge detection, 0.1 is a reasonable value and
	 * allows to catch most visible edges. 0.05 is a rather overkill value that
	 * allows to catch 'em all. Darker scenes may require an even lower threshold.
	 *
	 * If depth-based edge detection is used, the threshold will depend on the
	 * scene depth.
	 *
	 * @param {Number} threshold - The edge detection sensitivity. Range: [0.0, 0.5].
	 */

	setEdgeDetectionThreshold(threshold) {

		this.defines.EDGE_THRESHOLD = threshold.toFixed("6");
		this.defines.DEPTH_THRESHOLD = (threshold * 0.1).toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Sets the predication mode.
	 *
	 * Predicated thresholding allows to better preserve texture details and to
	 * improve edge detection using an additional buffer such as a light
	 * accumulation or depth buffer.
	 *
	 * @param {PredicationMode} mode - The predication mode.
	 */

	setPredicationMode(mode) {

		this.defines.PREDICATION_MODE = mode.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets a custom predication buffer.
	 *
	 * @param {Texture} predicationBuffer - The predication buffer.
	 */

	setPredicationBuffer(predicationBuffer) {

		this.uniforms.predicationBuffer.value = predicationBuffer;

	}

	/**
	 * Sets the predication threshold.
	 *
	 * @param {Number} threshold - The threshold.
	 */

	setPredicationThreshold(threshold) {

		this.defines.PREDICATION_THRESHOLD = threshold.toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Sets the predication scale.
	 *
	 * Determines how much the edge detection threshold should be scaled when
	 * using predication.
	 *
	 * @param {Number} scale - The scale. Range: [1.0, 5.0].
	 */

	setPredicationScale(scale) {

		this.defines.PREDICATION_SCALE = scale.toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Sets the predication strength.
	 *
	 * Determines how much the edge detection threshold should be decreased
	 * locally when using predication.
	 *
	 * @param {Number} strength - The strength. Range: [0.0, 1.0].
	 */

	setPredicationStrength(strength) {

		this.defines.PREDICATION_STRENGTH = strength.toFixed("6");
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

/**
 * An enumeration of predication modes.
 *
 * @type {Object}
 * @property {Number} DISABLED - No predicated thresholding.
 * @property {Number} DEPTH - Depth-based predicated thresholding.
 * @property {Number} CUSTOM - Predicated thresholding using a custom buffer.
 */

export const PredicationMode = {

	DISABLED: 0,
	DEPTH: 1,
	CUSTOM: 2

};
