import { EventDispatcher, Vector2, Vector2Like } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";

const AUTO_SIZE = -1;

/**
 * A resolution.
 *
 * @category Utils
 */

export class Resolution extends EventDispatcher<BaseEventMap> implements Vector2Like {

	/**
	 * Triggers when the resolution is changed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * An auto sizing constant.
	 *
	 * Can be used to automatically calculate the width or height based on the original aspect ratio.
	 */

	static readonly AUTO_SIZE = AUTO_SIZE;

	/**
	 * The unscaled base resolution in logical pixels.
	*/

	protected baseSize: Vector2;

	/**
	 * The unscaled preferred resolution in logical pixels.
	 */

	protected preferredSize: Vector2;

	/**
	 * The logical resolution in logical pixels.
	 */

	protected logicalSize: Vector2;

	/**
	 * The effective resolution in absolute pixels.
	 */

	protected effectiveSize: Vector2;

	/**
	 * @see {@link pixelRatio}
	 */

	protected _pixelRatio: number;

	/**
	 * @see {@link scale}
	 */

	protected _scale: number;

	/**
	 * Constructs a new resolution.
	 *
	 * @param width - The preferred width.
	 * @param height - The preferred height.
	 * @param scale - A resolution scale.
	 */

	constructor(width = AUTO_SIZE, height = AUTO_SIZE, scale = 1.0) {

		super();

		this.baseSize = new Vector2(1, 1);
		this.preferredSize = new Vector2(width, height);
		this.logicalSize = new Vector2();
		this.effectiveSize = new Vector2();
		this._pixelRatio = 1.0;
		this._scale = scale;

		this.addEventListener(Resolution.EVENT_CHANGE, () => this.updateEffectiveSize());
		this.updateEffectiveSize();

	}

	/**
	 * Calculates the effective size.
	 */

	private updateEffectiveSize(): void {

		const base = this.baseSize;
		const preferred = this.preferredSize;
		const logical = this.logicalSize;
		const effective = this.effectiveSize;

		logical.copy(base);

		if(preferred.width !== AUTO_SIZE) {

			// Absolute width.
			logical.width = preferred.width;

		} else if(preferred.height !== AUTO_SIZE) {

			// Dynamic width, absolute height.
			logical.width = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));

		}

		if(preferred.height !== AUTO_SIZE) {

			// Absolute height.
			logical.height = preferred.height;

		} else if(preferred.width !== AUTO_SIZE) {

			// Dynamic height, absolute width.
			logical.height = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));

		}

		logical.multiplyScalar(this.scale).round();
		effective.copy(logical).multiplyScalar(this.pixelRatio).floor();

	}

	/**
	 * The scaled base width in logical pixels.
	 */

	get logicalWidth(): number {

		return this.logicalSize.width;

	}

	/**
	 * The scaled base height in logical pixels.
	 */

	get logicalHeight(): number {

		return this.logicalSize.height;

	}

	/**
	 * The effective width, calculated based on the preferred size, pixel ratio and resolution scale.
	 */

	get width(): number {

		return this.effectiveSize.width;

	}

	/**
	 * The effective height, calculated based on the preferred size, pixel ratio and resolution scale.
	 */

	get height(): number {

		return this.effectiveSize.height;

	}

	/**
	 * The device pixel ratio.
	 *
	 * @defaultValue 1.0
	 */

	get pixelRatio(): number {

		return this._pixelRatio;

	}

	set pixelRatio(value: number) {

		if(this._pixelRatio !== value) {

			this._pixelRatio = value;
			this.setChanged();

		}

	}

	/**
	 * The resolution scale.
	 *
	 * @defaultValue 1.0
	 */

	get scale(): number {

		return this._scale;

	}

	set scale(value: number) {

		if(this._scale !== value) {

			this._scale = value;
			this.preferredSize.setScalar(AUTO_SIZE);
			this.setChanged();

		}

	}

	/**
	 * The unscaled base width in logical pixels.
	 *
	 * @defaultValue 1
	 */

	get baseWidth(): number {

		return this.baseSize.width;

	}

	set baseWidth(value: number) {

		if(this.baseSize.width !== value) {

			this.baseSize.width = value;
			this.setChanged();

		}

	}

	/**
	 * The unscaled base height in logical pixels.
	 *
	 * @defaultValue 1
	 */

	get baseHeight(): number {

		return this.baseSize.height;

	}

	set baseHeight(value: number) {

		if(this.baseSize.height !== value) {

			this.baseSize.height = value;
			this.setChanged();

		}

	}

	/**
	 * Sets the base size in logical pixels.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 */

	setBaseSize(width: number, height: number): void {

		if(this.baseSize.width !== width || this.baseSize.height !== height) {

			this.baseSize.set(width, height);
			this.setChanged();

		}

	}

	/**
	 * Copies the base size of a given resolution.
	 *
	 * @param resolution - A resolution.
	 */

	copyBaseSize(resolution: Resolution): void {

		if(!this.baseSize.equals(resolution.baseSize)) {

			this.baseSize.copy(resolution.baseSize);
			this.setChanged();

		}

	}

	/**
	 * The unscaled preferred width in logical pixels.
	 *
	 * @defaultValue {@link Resolution.AUTO_SIZE}
	 */

	get preferredWidth(): number {

		return this.preferredSize.width;

	}

	set preferredWidth(value: number) {

		if(this.preferredSize.width !== value) {

			this.preferredSize.width = value;
			this.setChanged();

		}

	}

	/**
	 * The unscaled preferred height in logical pixels.
	 *
	 * @defaultValue {@link Resolution.AUTO_SIZE}
	 */

	get preferredHeight(): number {

		return this.preferredSize.height;

	}

	set preferredHeight(value: number) {

		if(this.preferredSize.height !== value) {

			this.preferredSize.height = value;
			this.setChanged();

		}

	}

	/**
	 * Sets the preferred size in logical pixels.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 */

	setPreferredSize(width: number, height: number): void {

		if(this.preferredSize.width !== width || this.preferredSize.height !== height) {

			this.preferredSize.set(width, height);
			this.setChanged();

		}

	}

	/**
	 * Copies the preferred size of a given resolution.
	 *
	 * @param resolution - A resolution.
	 */

	copyPreferredSize(resolution: Resolution): void {

		if(!this.preferredSize.equals(resolution.preferredSize)) {

			this.preferredSize.copy(resolution.preferredSize);
			this.setChanged();

		}

	}

	/**
	 * Resets the preferred size.
	 */

	resetPreferredSize(): void {

		this.preferredSize.set(AUTO_SIZE, AUTO_SIZE);
		this.setChanged();

	}

	/**
	 * Sets the preferred size and resets the scale.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 */

	set(width: number, height: number): void {

		this._scale = 1.0;
		this.preferredSize.set(width, height);
		this.setChanged();

	}

	/**
	 * Copies the given resolution.
	 *
	 * @param resolution - The resolution.
	 */

	copy(resolution: Resolution): void {

		if(!this.equals(resolution)) {

			this.preferredSize.copy(resolution.preferredSize);
			this.baseSize.copy(resolution.baseSize);
			this._pixelRatio = resolution.pixelRatio;
			this._scale = resolution.scale;
			this.setChanged();

		}

	}

	/**
	 * Dispatches a `change` event.
	 *
	 * @internal
	 */

	setChanged(): void {

		this.dispatchEvent({ type: Resolution.EVENT_CHANGE });

	}

	get x(): number { return this.width; }
	get y(): number { return this.height; }

}
