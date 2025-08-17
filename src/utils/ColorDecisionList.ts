import { BaseEvent, EventDispatcher, Uniform, Vector3 } from "three";
import { CDLPreset } from "../enums/CDLPreset.js";

/**
 * ASC CDL events.
 *
 * @category Utils
 */

export interface CDLEventMap {

	toggle: BaseEvent;

}

/**
 * ASC CDL v1.2.
 *
 * The American Society of Cinematographers Color Decision List (ASC CDL) is a format for the exchange of basic primary
 * color grading information between equipment and software from different manufacturers. The format defines the math
 * for Slope, Offset, Power and Saturation.
 *
 * @see https://en.wikipedia.org/wiki/ASC_CDL
 * @see https://github.com/mrdoob/three.js/pull/28544
 * @category Utils
 */

export class ColorDecisionList extends EventDispatcher<CDLEventMap> {

	/**
	 * A uniform that contains the combined CDL data for use in a shader.
	 */

	readonly uniform: Uniform<{
		slope: Vector3;
		offset: Vector3;
		power: Vector3;
		saturation: number;
	}>;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * Constructs a new CDL configuration.
	 */

	constructor() {

		super();

		this.uniform = new Uniform({
			slope: new Vector3(1.0, 1.0, 1.0),
			offset: new Vector3(0.0, 0.0, 0.0),
			power: new Vector3(1.0, 1.0, 1.0),
			saturation: 1.0
		});

		this._enabled = true;

	}

	/**
	 * Indicates whether this CDL is enabled.
	 */

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		this._enabled = value;
		this.dispatchEvent({ type: "toggle" });

	}

	/**
	 * The slope. Valid values: (0 ≤ Slope < +Infinity).
	 */

	get slope(): Vector3 {

		return this.uniform.value.slope;

	}

	/**
	 * The offset. Valid values: (-Infinity < Offset < +Infinity)
	 */

	get offset(): Vector3 {

		return this.uniform.value.offset;

	}


	/**
	 * The power. Valid values: (0 < Power < +Infinity)
	 */

	get power(): Vector3 {

		return this.uniform.value.power;

	}

	/**
	 * The saturation. Valid values: (0 ≤ Saturation < +Infinity)
	 */

	get saturation(): number {

		return this.uniform.value.saturation;

	}

	set saturation(value: number) {

		this.uniform.value.saturation = value;

	}

	/**
	 * Applies the given CDL preset.
	 *
	 * @param preset - The preset.
	 */

	applyPreset(preset: CDLPreset | null): void {

		switch(preset) {

			case CDLPreset.DEFAULT:
				this.offset.set(0.0, 0.0, 0.0);
				this.slope.set(1.0, 1.0, 1.0);
				this.power.set(1.0, 1.0, 1.0);
				this.saturation = 1.0;
				break;

			case CDLPreset.GOLDEN:
				this.offset.set(0.0, 0.0, 0.0);
				this.slope.set(1.0, 0.9, 0.5);
				this.power.set(0.8, 0.8, 0.8);
				this.saturation = 0.8;
				break;

			case CDLPreset.PUNCHY:
				this.offset.set(0.0, 0.0, 0.0);
				this.slope.set(1.0, 1.0, 1.0);
				this.power.set(1.35, 1.35, 1.35);
				this.saturation = 1.4;
				break;

			case CDLPreset.NEEDLE:
				this.offset.set(0.0, 0.0, 0.0);
				this.slope.set(1.05, 1.05, 1.05);
				this.power.set(1.1, 1.1, 1.1);
				this.saturation = 1.15;
				break;

		}

	}

}
