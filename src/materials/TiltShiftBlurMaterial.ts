import { Uniform, Vector2, Vector4 } from "three";
import { KernelSize } from "../enums/KernelSize.js";
import { KawaseBlurMaterial } from "./KawaseBlurMaterial.js";

import fragmentShader from "./shaders/convolution.tilt-shift.frag";
import vertexShader from "./shaders/convolution.tilt-shift.vert";

/**
 * Tilt shift blur material options.
 *
 * @group Materials
 */

export interface TiltShiftBlurMaterialOptions {

	/**
	 * The blur kernel size.
	 */

	kernelSize?: KernelSize;

	/**
	 * The rotation of the focus area in radians.
	 */

	offset?: number;

	/**
	 * The relative offset of the focus area.
	 */

	rotation?: number;

	/**
	 * The relative size of the focus area.
	 */

	focusArea?: number;

	/**
	 * The softness of the focus area edges.
	 */

	feather?: number;

}

/**
 * A tilt shift material.
 */

export class TiltShiftBlurMaterial extends KawaseBlurMaterial {

	/**
	 * @see offset
	 */

	private _offset: number;

	/**
	 * @see focusArea
	 */

	private _focusArea: number;

	/**
	 * @see feather
	 */

	private _feather: number;

	/**
	 * Constructs a new tilt shift material.
	 *
	 * @param options - The options.
	 */

	constructor({
		kernelSize = KernelSize.MEDIUM,
		offset = 0.0,
		rotation = 0.0,
		focusArea = 0.4,
		feather = 0.3
	}: TiltShiftBlurMaterialOptions = {}) {

		super();

		this.fragmentShader = fragmentShader;
		this.vertexShader = vertexShader;

		this.uniforms.aspect = new Uniform(1.0);
		this.uniforms.rotation = new Uniform(new Vector2());
		this.uniforms.maskParams = new Uniform(new Vector4());

		this._offset = offset;
		this._focusArea = focusArea;
		this._feather = feather;

		this.kernelSize = kernelSize;
		this.rotation = rotation;
		this.updateParams();

	}

	/**
	 * The relative offset of the focus area.
	 */

	private updateParams(): void {

		const params = this.uniforms.maskParams.value as Vector4;
		const a = Math.max(this.focusArea, 0.0);
		const b = Math.max(a - this.feather, 0.0);

		params.set(
			this.offset - a, this.offset - b,
			this.offset + a, this.offset + b
		);

	}

	/**
	 * The rotation of the focus area in radians.
	 */

	get rotation(): number {

		const rotation = this.uniforms.rotation.value as Vector2;
		return Math.acos(rotation.x);

	}

	set rotation(value: number) {

		const rotation = this.uniforms.rotation.value as Vector2;
		rotation.set(Math.cos(value), Math.sin(value));

	}

	/**
	 * The relative offset of the focus area.
	 */

	get offset(): number {

		return this._offset;

	}

	set offset(value: number) {

		this._offset = value;
		this.updateParams();

	}

	/**
	 * The relative size of the focus area.
	 */

	get focusArea(): number {

		return this._focusArea;

	}

	set focusArea(value: number) {

		this._focusArea = value;
		this.updateParams();

	}

	/**
	 * The softness of the focus area edges.
	 */

	get feather(): number {

		return this._feather;

	}

	set feather(value: number) {

		this._feather = value;
		this.updateParams();

	}

	override setSize(width: number, height: number): void {

		super.setSize(width, height);
		this.uniforms.aspect.value = width / height;

	}

}
