import { NoBlending, ShaderMaterial, Texture, Uniform, Vector2 } from "three";
import { Resizable } from "../core/Resizable.js";
import { EdgeDetectionMode } from "../enums/EdgeDetectionMode.js";
import { PredicationMode } from "../enums/PredicationMode.js";

import fragmentShader from "./shaders/edge-detection.frag";
import vertexShader from "./shaders/edge-detection.vert";

/**
 * An edge detection material.
 *
 * @group Materials
 */

export class EdgeDetectionMaterial extends ShaderMaterial implements Resizable {

	/**
	 * Constructs a new edge detection material.
	 */

	constructor() {

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
				texelSize: new Uniform(new Vector2())
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.edgeDetectionMode = EdgeDetectionMode.COLOR;

	}

	/**
	 * The depth buffer.
	 */

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The edge detection mode.
	 */

	get edgeDetectionMode(): EdgeDetectionMode {

		return Number(this.defines.EDGE_DETECTION_MODE);

	}

	set edgeDetectionMode(value: EdgeDetectionMode) {

		this.defines.EDGE_DETECTION_MODE = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The local contrast adaptation factor. Has no effect if the edge detection mode is set to DEPTH. Default is 2.0.
	 *
	 * If a neighbor edge has _factor_ times bigger contrast than the current edge, the edge will be discarded.
	 *
	 * This allows to eliminate spurious crossing edges and is based on the fact that if there is too much contrast in a
	 * direction, the perceptual contrast in the other neighbors will be hidden.
	 */

	get localContrastAdaptationFactor(): number {

		return Number(this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR);

	}

	set localContrastAdaptationFactor(value: number) {

		this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = value.toFixed(6);
		this.needsUpdate = true;

	}

	/**
	 * The edge detection threshold. Range: [0.0, 0.5].
	 *
	 * A lower value results in more edges being detected at the expense of performance.
	 *
	 * For luma- and chroma-based edge detection, 0.1 is a reasonable value and allows to catch most visible edges. 0.05
	 * is a rather overkill value that allows to catch 'em all. Darker scenes may require an even lower threshold.
	 *
	 * If depth-based edge detection is used, the threshold will depend on the scene depth.
	 */

	get edgeDetectionThreshold(): number {

		return Number(this.defines.EDGE_THRESHOLD);

	}

	set edgeDetectionThreshold(value: number) {

		this.defines.EDGE_THRESHOLD = value.toFixed(6);
		this.defines.DEPTH_THRESHOLD = (value * 0.1).toFixed(6);
		this.needsUpdate = true;

	}

	/**
	 * The predication mode.
	 *
	 * Predicated thresholding allows to better preserve texture details and to improve edge detection using an additional
	 * buffer such as a light accumulation or depth buffer.
	 */

	get predicationMode(): PredicationMode {

		return Number(this.defines.PREDICATION_MODE);

	}

	set predicationMode(value: PredicationMode) {

		this.defines.PREDICATION_MODE = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The predication buffer.
	 */

	set predicationBuffer(value: Texture) {

		this.uniforms.predicationBuffer.value = value;

	}

	/**
	 * The predication threshold.
	 *
	 * @type {Number}
	 */

	get predicationThreshold(): number {

		return Number(this.defines.PREDICATION_THRESHOLD);

	}

	set predicationThreshold(value: number) {

		this.defines.PREDICATION_THRESHOLD = value.toFixed(6);
		this.needsUpdate = true;

	}

	/**
	 * The predication scale. Range: [1.0, 5.0].
	 *
	 * Determines how much the edge detection threshold should be scaled when using predication.
	 */

	get predicationScale(): number {

		return Number(this.defines.PREDICATION_SCALE);

	}

	set predicationScale(value: number) {

		this.defines.PREDICATION_SCALE = value.toFixed(6);
		this.needsUpdate = true;

	}

	/**
	 * The predication strength. Range: [0.0, 1.0].
	 *
	 * Determines how much the edge detection threshold should be decreased locally when using predication.
	 */

	get predicationStrength(): number {

		return Number(this.defines.PREDICATION_STRENGTH);

	}

	set predicationStrength(value: number) {

		this.defines.PREDICATION_STRENGTH = value.toFixed(6);
		this.needsUpdate = true;

	}

	setSize(width: number, height: number): void {

		const texelSize = this.uniforms.texelSize.value as Vector2;
		texelSize.set(1.0 / width, 1.0 / height);

	}

}
