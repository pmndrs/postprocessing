import { Vector2, Vector4Like } from "three";
import { Resolution } from "./Resolution.js";

/**
 * A viewport.
 *
 * @category Utils
 */

export class Viewport extends Resolution implements Vector4Like {

	/**
	 * The current offset.
	 */

	private offset: Vector2;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * Constructs a new viewport/scissor.
	 */

	constructor() {

		super();

		this.offset = new Vector2();
		this._enabled = false;

	}

	/**
	 * Indicates whether this viewport/scissor is enabled.
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
	 * The current offset along the X-axis in logical pixels.
	 *
	 * @defaultValue 0
	 */

	get offsetX(): number {

		return this.offset.x;

	}

	set offsetX(value: number) {

		if(this.offsetX !== value) {

			this.offset.x = value;
			this.setChanged();

		}

	}

	/**
	 * The current offset along the Y-axis in logical pixels.
	 *
	 * @defaultValue 0
	 */

	get offsetY(): number {

		return this.offset.y;

	}

	set offsetY(value: number) {

		if(this.offsetY !== value) {

			this.offset.y = value;
			this.setChanged();

		}

	}

	/**
	 * Sets the offset.
	 *
	 * @param x - The X-offset.
	 * @param y - The Y-offset.
	 */

	setOffset(x: number, y: number): void {

		if(this.offset.x !== x || this.offset.y !== y) {

			this.offset.set(x, y);
			this.setChanged();

		}

	}

	override get x(): number { return this.offset.x; }
	override get y(): number { return this.offset.y; }
	get z(): number { return this.width; }
	get w(): number { return this.height; }

	/**
	 * Sets the offset and preferred size.
	 *
	 * If the width and height are omitted, x and y will be used for the size instead.
	 *
	 * @param x - The X-offset.
	 * @param y - The Y-offset.
	 * @param width - The width.
	 * @param height - The height.
	 */

	override set(x: number, y: number, width?: number, height?: number): void {

		if(width === undefined || height === undefined) {

			super.set(x, y);

		} else {

			this.offset.set(x, y);
			super.set(width, height);

		}

	}

	override copy(viewport: Viewport): void {

		this.offset.copy(viewport.offset);
		this.enabled = viewport.enabled;
		super.copy(viewport);

	}

}
