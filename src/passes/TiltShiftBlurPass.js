import { Resolution } from "../core/Resolution.js";
import { KernelSize } from "../enums/KernelSize.js";
import { TiltShiftBlurMaterial } from "../materials/TiltShiftBlurMaterial.js";
import { KawaseBlurPass } from "./KawaseBlurPass.js";

/**
 * A tilt shift blur pass.
 */

export class TiltShiftBlurPass extends KawaseBlurPass {

	/**
	 * Constructs a new Kawase blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.offset=0.0] - The relative offset of the focus area.
	 * @param {Number} [options.rotation=0.0] - The rotation of the focus area in radians.
	 * @param {Number} [options.focusArea=0.4] - The relative size of the focus area.
	 * @param {Number} [options.feather=0.3] - The softness of the focus area edges.
	 * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 */

	constructor({
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3,
		kernelSize = KernelSize.MEDIUM,
		resolutionScale = 0.5,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super({ kernelSize, resolutionScale, resolutionX, resolutionY });
		this.blurMaterial = new TiltShiftBlurMaterial({ kernelSize, offset, rotation, focusArea, feather });

	}

}
