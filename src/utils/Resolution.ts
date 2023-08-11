import { EventDispatcher, Vector2 } from "three";

const AUTO_SIZE = -1;

/**
 * A resolution.
 *
 * @group Utils
 */

export class Resolution extends EventDispatcher {

	/**
	 * An auto sizing constant.
	 *
	 * Can be used to automatically calculate the width or height based on the original aspect ratio.
	 */

	static readonly AUTO_SIZE = AUTO_SIZE;

	/**
	 * The base resolution.
	*/

	private baseSize: Vector2;

	/**
	 * The preferred resolution.
	 */

	private preferredSize: Vector2;

	/**
	 * The effective resolution.
	 */

	private effectiveSize: Vector2;

	/**
	 * @see {@link scale}
	 */

	private _scale: number;

	/**
	 * Indicates whether a `change` event has recently been dispatched.
	 */

	private locked: boolean;

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
		this.effectiveSize = new Vector2();
		this._scale = scale;
		this.locked = false;

		this.addEventListener("change", () => this.updateEffectiveSize());
		this.updateEffectiveSize();

	}

	/**
	 * Calculates the effective size.
	 */

	private updateEffectiveSize(): void {

		const base = this.baseSize;
		const preferred = this.preferredSize;
		const effective = this.effectiveSize;

		effective.copy(base);

		if(preferred.width !== AUTO_SIZE) {

			// Absolute width.
			effective.width = preferred.width;

		} else if(preferred.height !== AUTO_SIZE) {

			// Dynamic width, absolute height.
			effective.width = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));

		}

		if(preferred.height !== AUTO_SIZE) {

			// Absolute height.
			effective.height = preferred.height;

		} else if(preferred.width !== AUTO_SIZE) {

			// Dynamic height, absolute width.
			effective.height = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));

		}

		effective.multiplyScalar(this.scale).round();

	}

	/**
	 * The effective width, calculated based on the preferred size and resolution scale.
	 */

	get width(): number {

		return this.effectiveSize.width;

	}

	/**
	 * The effective height, calculated based on the preferred size and resolution scale.
	 */

	get height(): number {

		return this.effectiveSize.height;

	}

	/**
	 * The resolution scale.
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
	 * The base width.
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
	 * The base height.
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
	 * Sets the base size.
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
	 * The preferred width.
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
	 * The preferred height.
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
	 * Sets the preferred size.
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
	 * Copies the given resolution.
	 *
	 * @param resolution - The resolution.
	 */

	copy(resolution: Resolution): void {

		this._scale = resolution.scale;
		this.baseSize.set(resolution.baseWidth, resolution.baseHeight);
		this.preferredSize.set(resolution.preferredWidth, resolution.preferredHeight);
		this.setChanged();

	}

	/**
	 * Dispatches a `change` event.
	 */

	private setChanged() {

		if(!this.locked) {

			this.locked = true;
			this.dispatchEvent({ type: "change" });
			this.locked = false;

		} else {

			throw new Error("The resolution may not be changed during a change event");

		}

	}

}
