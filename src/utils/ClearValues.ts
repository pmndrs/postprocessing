import { Color, EventDispatcher, Vector4 } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { GBuffer } from "../enums/GBuffer.js";
import { ObservableMap } from "./ObservableMap.js";

/**
 * A collection of clear values.
 *
 * @category Utils
 */

export class ClearValues extends EventDispatcher<BaseEventMap> {

	/**
	 * @see {@link color}
	 */

	private _color: Color | null;

	/**
	 * @see {@link alpha}
	 */

	private _alpha: number | null;

	/**
	 * A collection that maps {@link GBuffer} components to clear values.
	 */

	readonly gBuffer: Map<GBuffer | string, Vector4>;

	/**
	 * Constructs new clear values.
	 */

	constructor() {

		super();

		this._color = null;
		this._alpha = null;

		const gBuffer = new ObservableMap<GBuffer | string, Vector4>([
			[GBuffer.NORMAL, new Vector4(0.5, 0.5, 1.0, 1.0)],
			[GBuffer.ORM, new Vector4(1.0, 0.0, 0.0, 1.0)],
			[GBuffer.EMISSION, new Vector4(0.0, 0.0, 0.0, 1.0)]
		]);

		gBuffer.addEventListener("change", () => this.setChanged());
		this.gBuffer = gBuffer;

	}

	/**
	 * A clear color that overrides the clear color of the renderer.
	 *
	 * @defaultValue null
	 */

	get color(): Color | null {

		return this._color;

	}

	set color(value: Color | null) {

		this._color = value;
		this.setChanged();

	}

	/**
	 * A clear alpha value that overrides the clear alpha of the renderer.
	 *
	 * @defaultValue null
	 */

	get alpha(): number | null {

		return this._alpha;

	}

	set alpha(value: number | null) {

		this._alpha = value;
		this.setChanged();

	}

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

}
