import { sRGBEncoding, Uniform, Vector2, Vector4, WebGLRenderTarget } from "three";
import { Resolution } from "../core";
import { KernelSize } from "../enums";
import { TiltShiftBlurPass } from "../passes";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/tilt-shift.frag";
import vertexShader from "./glsl/tilt-shift.vert";

/**
 * A tilt shift effect.
 */

export class TiltShiftEffect extends Effect {

	/**
   * Constructs a new tilt shift Effect
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
   * @param {Number} [options.offset=0.0] - The relative offset of the focus area.
   * @param {Number} [options.rotation=0.0] - The rotation of the focus area in radians.
   * @param {Number} [options.focusArea=0.4] - The relative size of the focus area.
   * @param {Number} [options.feather=0.3] - The softness of the focus area edges.
   * @param {Number} [options.bias=0.06] - A blend bias.
	 * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
   */

	constructor({
		blendFunction,
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3
		bias = 0.06,
		kernelSize = KernelSize.MEDIUM,
		resolutionScale = 0.5,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("TiltShiftEffect", fragmentShader, {
			vertexShader,
			blendFunction,
			uniforms: new Map([
				["rotation", new Uniform(new Vector2())],
				["maskParams", new Uniform(new Vector4())],
				["map", new Uniform(null)]
			])
		});

		/**
		 * @see {@link offset}
		 * @type {Number}
		 * @private
		 */

		this._offset = offset;

		/**
		 * @see {@link focusArea}
		 * @type {Number}
		 * @private
		 */

		this._focusArea = focusArea;

		/**
		 * @see {@link feather}
		 * @type {Number}
		 * @private
		 */

		this._feather = feather;

		/**
		 * @see {@link bias}
		 * @type {Number}
		 * @private
		 */

		this._bias = bias;

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "TiltShift.Target";
		this.uniforms.get("map").value = this.renderTarget.texture;

		/**
		 * A blur pass.
		 *
		 * @type {TiltShiftBlurPass}
		 * @readonly
		 */

		this.blurPass = new TiltShiftBlurPass({
			kernelSize,
			resolutionScale,
			resolutionX,
			resolutionY,
			offset,
			rotation,
			focusArea,
			feather
		});

		/**
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

		this.rotation = rotation;
		this.updateParams();

	}

	/**
	 * The relative offset of the focus area.
	 *
	 * @private
	 */

	updateParams() {

		const params = this.uniforms.get("maskParams").value;
		const a = Math.max(this.focusArea - this.bias, 0.0);
		const b = Math.max(a - Math.max(this.feather - this.bias, 0.0), 0.0);

		params.set(
			this.offset - a, this.offset - b,
			this.offset + a, this.offset + b
		);

	}

	/**
	 * The rotation of the focus area in radians.
	 *
	 * @type {Number}
	 */

	get rotation() {

		return Math.acos(this.uniforms.get("rotation").value.x);

	}

	set rotation(value) {

		this.uniforms.get("rotation").value.set(Math.cos(value), Math.sin(value));
		this.blurPass.blurMaterial.rotation = value;

	}

	/**
	 * The relative offset of the focus area.
	 *
	 * @type {Number}
	 */

	get offset() {

		return this._offset;

	}

	set offset(value) {

		this._offset = value;
		this.blurPass.blurMaterial.offset = value;
		this.updateParams();

	}

	/**
	 * The relative size of the focus area.
	 *
	 * @type {Number}
	 */

	get focusArea() {

		return this._focusArea;

	}

	set focusArea(value) {

		this._focusArea = value;
		this.blurPass.blurMaterial.focusArea = value;
		this.updateParams();

	}

	/**
	 * The softness of the focus area edges.
	 *
	 * @type {Number}
	 */

	get feather() {

		return this._feather;

	}

	set feather(value) {

		this._feather = value;
		this.blurPass.blurMaterial.feather = value;
		this.updateParams();

	}

	/**
	 * A blend bias.
	 *
	 * @type {Number}
	 */

	get bias() {

		return this._bias;

	}

	set bias(value) {

		this._bias = value;
		this.updateParams();

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		this.blurPass.render(renderer, inputBuffer, this.renderTarget);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);

		this.renderTarget.setSize(resolution.width, resolution.height);
		this.blurPass.resolution.copy(resolution);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.blurPass.initialize(renderer, alpha, frameBufferType);

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

			if(renderer.outputEncoding === sRGBEncoding) {

				this.renderTarget.texture.encoding = sRGBEncoding;

			}

		}

	}

}
