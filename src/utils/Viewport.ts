import { Vector2, Vector4Like } from "three";
import { Resolution } from "./Resolution.js";

/**
 * A viewport.
 *
 * @category Utils
 */

export class Viewport extends Resolution implements Vector4Like {

	/**
	 * The offset in logical pixels.
	 */

	private offset: Vector2;

	/**
	 * The effective offset.
	 */

	private effectiveOffset: Vector2;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * Constructs a new viewport.
	 */

	constructor() {

		super();

		this.offset = new Vector2();
		this.effectiveOffset = new Vector2();
		this._enabled = false;

		this.addEventListener("change", () => this.updateEffectiveOffset());

	}

	/**
	 * Calculates the effective offset.
	 */

	private updateEffectiveOffset(): void {

		this.effectiveOffset.copy(this.offset).multiplyScalar(this.scaledPixelRatio).floor();

	}

	/**
	 * Indicates whether this viewport is enabled.
	 *
	 * @defaultValue false
	 */

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		if(this._enabled !== value) {

			this._enabled = value;
			this.setChanged();

		}

	}

	/**
	 * The effective offset along the X-axis, calculated based on the scale and pixel ratio.
	 *
	 * @defaultValue 0
	 */

	get offsetX(): number {

		return this.effectiveOffset.x;

	}

	/**
	 * The effective offset along the Y-axis, calculated based on the scale and pixel ratio.
	 *
	 * @defaultValue 0
	 */

	get offsetY(): number {

		return this.effectiveOffset.y;

	}

	/**
	 * Sets the offset in logical pixels.
	 *
	 * @param x - The X-offset.
	 * @param y - The Y-offset.
	 */

	setOffset(x: number, y: number): void {

		if(this.offset.x !== x || this.offset.y !== y) {

			this.offset.set(x, y);
			this.updateEffectiveOffset();
			this.setChanged();

		}

	}

	/**
	 * Sets the offset and the preferred size in logical pixels.
	 *
	 * If the width and height are omitted, x and y will be used for the size instead.
	 *
	 * @param x - The X-offset.
	 * @param y - The Y-offset.
	 * @param width - The width.
	 * @param height - The height.
	 */

	set(x: number, y: number, width?: number, height?: number): void {

		if(width === undefined || height === undefined) {

			super.setPreferredSize(x, y);

		} else {

			this.offset.set(x, y);
			this.updateEffectiveOffset();
			super.setPreferredSize(width, height);

		}

	}

	override copy(viewport: Viewport | Resolution): void {

		if(viewport instanceof Viewport) {

			if(!this.equals(viewport)) {

				this.enabled = viewport.enabled;
				this.offset.copy(viewport.offset);
				this.effectiveOffset.copy(viewport.effectiveOffset);
				super.copy(viewport);

			}

		} else {

			super.copy(viewport);

		}

	}

	override equals(viewport: Viewport): boolean {

		return (
			this.enabled === viewport.enabled &&
			this.offset.equals(viewport.offset) &&
			super.equals(viewport)
		);

	}

	override get x(): number { return this.effectiveOffset.x; }
	override get y(): number { return this.effectiveOffset.y; }
	get z(): number { return this.width; }
	get w(): number { return this.height; }

}
