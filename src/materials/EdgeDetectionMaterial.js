import { NoBlending, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/edge-detection/shader.frag";
import vertexShader from "./glsl/edge-detection/shader.vert";

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

/**
 * An edge detection material.
 *
 * Mainly used for Subpixel Morphological Anti-Aliasing.
 *
 * @implements {Resizable}
 */

export class EdgeDetectionMaterial extends ShaderMaterial {

	/**
	 * Constructs a new edge detection material.
	 *
	 * TODO Remove parameters.
	 * @param {Vector2} [texelSize] - The screen texel size.
	 * @param {EdgeDetectionMode} [mode=EdgeDetectionMode.COLOR] - The edge detection mode.
	 */

	constructor(texelSize = new Vector2(), mode = EdgeDetectionMode.COLOR) {

		super({
			name: "EdgeDetectionMaterial",
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
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		this.setEdgeDetectionMode(mode);

	}

	/**
	 * Sets the depth buffer.
	 *
	 * @param {Texture} buffer - The depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {

		this.uniforms.depthBuffer.value = buffer;
		this.defines.DEPTH_PACKING = depthPacking.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The current depth packing.
	 *
	 * @type {DepthPackingStrategies}
	 * @deprecated Removed without replacement.
	 */

	get depthPacking() {

		return Number(this.defines.DEPTH_PACKING);

	}

	/**
	 * Sets the depth packing.
	 *
	 * @type {DepthPackingStrategies}
	 * @deprecated Use setDepthBuffer() instead.
	 */

	set depthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Returns the edge detection mode.
	 *
	 * @return {EdgeDetectionMode} The mode.
	 */

	getEdgeDetectionMode() {

		return Number(this.defines.EDGE_DETECTION_MODE);

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
	 * Returns the local contrast adaptation factor.
	 *
	 * @return {Number} The factor.
	 */

	getLocalContrastAdaptationFactor() {

		return Number(this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR);

	}

	/**
	 * Sets the local contrast adaptation factor. Has no effect if the edge detection mode is set to DEPTH.
	 *
	 * If a neighbor edge has _factor_ times bigger contrast than the current edge, the edge will be discarded.
	 *
	 * This allows to eliminate spurious crossing edges and is based on the fact that if there is too much contrast in a
	 * direction, the perceptual contrast in the other neighbors will be hidden.
	 *
	 * @param {Number} factor - The local contrast adaptation factor. Default is 2.0.
	 */

	setLocalContrastAdaptationFactor(factor) {

		this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = factor.toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Returns the edge detection threshold.
	 *
	 * @return {Number} The threshold.
	 */

	getEdgeDetectionThreshold() {

		return Number(this.defines.EDGE_THRESHOLD);

	}

	/**
	 * Sets the edge detection threshold.
	 *
	 * A lower value results in more edges being detected at the expense of performance.
	 *
	 * For luma- and chroma-based edge detection, 0.1 is a reasonable value and allows to catch most visible edges. 0.05
	 * is a rather overkill value that allows to catch 'em all. Darker scenes may require an even lower threshold.
	 *
	 * If depth-based edge detection is used, the threshold will depend on the scene depth.
	 *
	 * @param {Number} threshold - The edge detection threshold. Range: [0.0, 0.5].
	 */

	setEdgeDetectionThreshold(threshold) {

		this.defines.EDGE_THRESHOLD = threshold.toFixed("6");
		this.defines.DEPTH_THRESHOLD = (threshold * 0.1).toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Returns the predication mode.
	 *
	 * @return {PredicationMode} The mode.
	 */

	getPredicationMode() {

		return Number(this.defines.PREDICATION_MODE);

	}

	/**
	 * Sets the predication mode.
	 *
	 * Predicated thresholding allows to better preserve texture details and to improve edge detection using an additional
	 * buffer such as a light accumulation or depth buffer.
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
	 * Returns the predication threshold.
	 *
	 * @return {Number} The threshold.
	 */

	getPredicationThreshold() {

		return Number(this.defines.PREDICATION_THRESHOLD);

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
	 * Returns the predication scale.
	 *
	 * @return {Number} The scale.
	 */

	getPredicationScale() {

		return Number(this.defines.PREDICATION_SCALE);

	}

	/**
	 * Sets the predication scale.
	 *
	 * Determines how much the edge detection threshold should be scaled when using predication.
	 *
	 * @param {Number} scale - The scale. Range: [1.0, 5.0].
	 */

	setPredicationScale(scale) {

		this.defines.PREDICATION_SCALE = scale.toFixed("6");
		this.needsUpdate = true;

	}

	/**
	 * Returns the predication strength.
	 *
	 * @return {Number} The strength.
	 */

	getPredicationStrength() {

		return Number(this.defines.PREDICATION_STRENGTH);

	}

	/**
	 * Sets the predication strength.
	 *
	 * Determines how much the edge detection threshold should be decreased locally when using predication.
	 *
	 * @param {Number} strength - The strength. Range: [0.0, 1.0].
	 */

	setPredicationStrength(strength) {

		this.defines.PREDICATION_STRENGTH = strength.toFixed("6");
		this.needsUpdate = true;

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
