import { BaseEvent, EventDispatcher, Uniform } from "three";
import { BlendFunction } from "./BlendFunction.js";

/**
 * BlendMode events.
 *
 * @group Blending
 */

export interface BlendModeEventMap {

	change: BaseEvent;

}

/**
 * A blend mode.
 *
 * @group Blending
 */

export class BlendMode extends EventDispatcher<BlendModeEventMap> {

	/**
	 * Triggers when the blend function is changed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * @see {@link blendFunction}
	 */

	private _blendFunction: BlendFunction;

	/**
	 * A uniform that controls the opacity of this blend mode.
	 *
	 * @see {@link opacity}
	 */

	readonly opacityUniform: Uniform;

	/**
	 * Constructs a new blend mode.
	 *
	 * @param blendFunction - The blend function.
	 * @param opacity - The opacity of the new color that will be blended with the base color.
	 */

	constructor(blendFunction: BlendFunction, opacity = 1.0) {

		super();

		this._blendFunction = blendFunction;
		this.opacityUniform = new Uniform(opacity);

	}

	/**
	 * A convenience accessor for the opacity uniform value.
	 *
	 * @see {@link opacityUniform}
	 */

	get opacity(): number {

		return this.opacityUniform.value as number;

	}

	set opacity(value: number) {

		this.opacityUniform.value = value;

	}

	/**
	 * The blend function.
	 */

	get blendFunction() {

		return this._blendFunction;

	}

	set blendFunction(value) {

		this._blendFunction = value;
		this.dispatchEvent({ type: BlendMode.EVENT_CHANGE });

	}

}
