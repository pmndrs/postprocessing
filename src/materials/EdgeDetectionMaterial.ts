import { Texture, Uniform, UnsignedByteType } from "three";
import { EdgeDetectionMode } from "../enums/EdgeDetectionMode.js";
import { PredicationMode } from "../enums/PredicationMode.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/edge-detection.frag";
import vertexShader from "./shaders/edge-detection.vert";

/**
 * An edge detection material.
 *
 * @category Materials
 */

export class EdgeDetectionMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new edge detection material.
	 */

	constructor() {

		super({
			name: "EdgeDetectionMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				LOCAL_CONTRAST_ADAPTATION_FACTOR: 2,
				EDGE_DETECTION_MODE: EdgeDetectionMode.COLOR,
				EDGE_THRESHOLD: 0.1,
				DEPTH_THRESHOLD: 0.01,
				PREDICATION_MODE: PredicationMode.DISABLED,
				PREDICATION_THRESHOLD: 0.01,
				PREDICATION_SCALE: 2,
				PREDICATION_STRENGTH: 1
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				predicationBuffer: new Uniform(null)
			}
		});

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

		return this.defines.EDGE_DETECTION_MODE as EdgeDetectionMode;

	}

	set edgeDetectionMode(value: EdgeDetectionMode) {

		this.defines.EDGE_DETECTION_MODE = value;
		this.needsUpdate = true;

	}

	/**
	 * The local contrast adaptation factor. Has no effect if the edge detection mode is set to DEPTH.
	 *
	 * If a neighbor edge has _factor_ times bigger contrast than the current edge, the edge will be discarded.
	 *
	 * This allows to eliminate spurious crossing edges and is based on the fact that if there is too much contrast in a
	 * direction, the perceptual contrast in the other neighbors will be hidden.
	 *
	 * @defaultValue 2
	 */

	get localContrastAdaptationFactor(): number {

		return Number(this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR);

	}

	set localContrastAdaptationFactor(value: number) {

		this.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR = value.toFixed(9);
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

		this.defines.EDGE_THRESHOLD = value.toFixed(9);
		this.defines.DEPTH_THRESHOLD = (value * 0.1).toFixed(9);
		this.needsUpdate = true;

	}

	/**
	 * The predication mode.
	 *
	 * Predicated thresholding allows to better preserve texture details and to improve edge detection using an additional
	 * buffer such as a light accumulation or depth buffer.
	 */

	get predicationMode(): PredicationMode {

		return this.defines.PREDICATION_MODE as PredicationMode;

	}

	set predicationMode(value: PredicationMode) {

		this.defines.PREDICATION_MODE = value;
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether the predication buffer uses high precision.
	 */

	private get predicationBufferPrecisionHigh(): boolean {

		return (this.defines.PREDICATIONBUFFER_PRECISION_HIGH !== undefined);

	}

	private set predicationBufferPrecisionHigh(value: boolean) {

		if(this.predicationBufferPrecisionHigh !== value) {

			if(value) {

				this.defines.PREDICATIONBUFFER_PRECISION_HIGH = true;

			} else {

				delete this.defines.PREDICATIONBUFFER_PRECISION_HIGH;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * The predication buffer.
	 *
	 * If this buffer uses high precision, the macro `PREDICATIONBUFFER_PRECISION_HIGH` will be defined.
	 */

	set predicationBuffer(value: Texture | null) {

		this.predicationBufferPrecisionHigh = value !== null && value.type !== UnsignedByteType;
		this.uniforms.predicationBuffer.value = value;

	}

	/**
	 * The predication threshold.
	 */

	get predicationThreshold(): number {

		return Number(this.defines.PREDICATION_THRESHOLD);

	}

	set predicationThreshold(value: number) {

		this.defines.PREDICATION_THRESHOLD = value.toFixed(9);
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

		this.defines.PREDICATION_SCALE = value.toFixed(9);
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

		this.defines.PREDICATION_STRENGTH = value.toFixed(9);
		this.needsUpdate = true;

	}

}
