import { EventDispatcher, Vector2 } from "three";

const AUTO_SIZE = -1;

/**
 * A resolution.
 */

export class Resolution extends EventDispatcher {

	/**
	 * Constructs a new resolution.
	 *
	 * TODO Remove resizable param.
	 * @param {Resizable} resizable - A resizable object.
	 * @param {Number} [width=Resolution.AUTO_SIZE] - The preferred width.
	 * @param {Number} [height=Resolution.AUTO_SIZE] - The preferred height.
	 * @param {Number} [scale=1.0] - A resolution scale.
	 */

	constructor(resizable, width = AUTO_SIZE, height = AUTO_SIZE, scale = 1.0) {

		super();

		/**
		 * A resizable object.
		 *
		 * @type {Resizable}
		 * @deprecated Use an event listener for "change" events instead.
		 */

		this.resizable = resizable;

		/**
		 * The base resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.baseSize = new Vector2(1, 1);

		/**
		 * The preferred resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.preferredSize = new Vector2(width, height);

		/**
		 * The preferred resolution.
		 *
		 * @type {Vector2}
		 * @deprecated Added for backward-compatibility.
		 */

		this.target = this.preferredSize;

		/**
		 * A resolution scale.
		 *
		 * @type {Number}
		 * @private
		 */

		this.s = scale;

		/**
		 * The effective resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.effectiveSize = new Vector2();
		this.addEventListener("change", () => this.updateEffectiveSize());
		this.updateEffectiveSize();

	}

	/**
	 * Calculates the effective size.
	 *
	 * @private
	 */

	updateEffectiveSize() {

		const base = this.baseSize;
		const preferred = this.preferredSize;
		const effective = this.effectiveSize;
		const scale = this.scale;

		if(preferred.width !== AUTO_SIZE) {

			effective.width = preferred.width;

		} else if(preferred.height !== AUTO_SIZE) {

			effective.width = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));

		} else {

			effective.width = Math.round(base.width * scale);

		}

		if(preferred.height !== AUTO_SIZE) {

			effective.height = preferred.height;

		} else if(preferred.width !== AUTO_SIZE) {

			effective.height = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));

		} else {

			effective.height = Math.round(base.height * scale);

		}

	}

	/**
	 * The effective width.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.effectiveSize.width;

	}

	set width(value) {

		this.preferredWidth = value;

	}

	/**
	 * The effective height.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.effectiveSize.height;

	}

	set height(value) {

		this.preferredHeight = value;

	}

	/**
	 * Returns the effective width.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	 *
	 * @deprecated Use width instead.
	 * @return {Number} The effective width.
	 */

	getWidth() {

		return this.width;

	}

	/**
	 * Returns the effective height.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
	 *
	 * @deprecated Use height instead.
	 * @return {Number} The effective height.
	 */

	getHeight() {

		return this.height;

	}

	/**
	 * The resolution scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.s;

	}

	set scale(value) {

		if(this.s !== value) {

			this.s = value;
			this.preferredSize.setScalar(AUTO_SIZE);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @deprecated Use scale instead.
	 * @return {Number} The scale.
	 */

	getScale() {

		return this.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * Also sets the preferred resolution to {@link Resizer.AUTO_SIZE}.
	 *
	 * @deprecated Use scale instead.
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		this.scale = value;

	}

	/**
	 * The base width.
	 *
	 * @type {Number}
	 */

	get baseWidth() {

		return this.baseSize.width;

	}

	set baseWidth(value) {

		if(this.baseSize.width !== value) {

			this.baseSize.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Returns the base width.
	 *
	 * @deprecated Use baseWidth instead.
	 * @return {Number} The base width.
	 */

	getBaseWidth() {

		return this.baseWidth;

	}

	/**
	 * Sets the base width.
	 *
	 * @deprecated Use baseWidth instead.
	 * @param {Number} value - The width.
	 */

	setBaseWidth(value) {

		this.baseWidth = value;

	}

	/**
	 * The base height.
	 *
	 * @type {Number}
	 */

	get baseHeight() {

		return this.baseSize.height;

	}

	set baseHeight(value) {

		if(this.baseSize.height !== value) {

			this.baseSize.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Returns the base height.
	 *
	 * @deprecated Use baseHeight instead.
	 * @return {Number} The base height.
	 */

	getBaseHeight() {

		return this.baseHeight;

	}

	/**
	 * Sets the base height.
	 *
	 * @deprecated Use baseHeight instead.
	 * @param {Number} value - The height.
	 */

	setBaseHeight(value) {

		this.baseHeight = value;

	}

	/**
	 * Sets the base size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setBaseSize(width, height) {

		if(this.baseSize.width !== width || this.baseSize.height !== height) {

			this.baseSize.set(width, height);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * The preferred width.
	 *
	 * @type {Number}
	 */

	get preferredWidth() {

		return this.preferredSize.width;

	}

	set preferredWidth(value) {

		if(this.preferredSize.width !== value) {

			this.preferredSize.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Returns the preferred width.
	 *
	 * @deprecated Use preferredWidth instead.
	 * @return {Number} The preferred width.
	 */

	getPreferredWidth() {

		return this.preferredWidth;

	}

	/**
	 * Sets the preferred width.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based on the height and aspect ratio.
	 *
	 * @deprecated Use preferredWidth instead.
	 * @param {Number} value - The width.
	 */

	setPreferredWidth(value) {

		this.preferredWidth = value;

	}

	/**
	 * The preferred height.
	 *
	 * @type {Number}
	 */

	get preferredHeight() {

		return this.preferredSize.height;

	}

	set preferredHeight(value) {

		if(this.preferredSize.height !== value) {

			this.preferredSize.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Returns the preferred height.
	 *
	 * @deprecated Use preferredHeight instead.
	 * @return {Number} The preferred height.
	 */

	getPreferredHeight() {

		return this.preferredHeight;

	}

	/**
	 * Sets the preferred height.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based on the width and aspect ratio.
	 *
	 * @deprecated Use preferredHeight instead.
	 * @param {Number} value - The height.
	 */

	setPreferredHeight(value) {

		this.preferredHeight = value;

	}

	/**
	 * Sets the preferred size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setPreferredSize(width, height) {

		if(this.preferredSize.width !== width || this.preferredSize.height !== height) {

			this.preferredSize.set(width, height);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.baseSize.width, this.baseSize.height);

		}

	}

	/**
	 * Copies the given resolution.
	 *
	 * @param {Resolution} resolution - The resolution.
	 */

	copy(resolution) {

		this.s = resolution.scale;
		this.baseSize.set(resolution.baseWidth, resolution.baseHeight);
		this.preferredSize.set(resolution.preferredWidth, resolution.preferredHeight);
		this.dispatchEvent({ type: "change" });
		this.resizable.setSize(this.baseSize.width, this.baseSize.height);

	}

	/**
	 * An auto sizing constant.
	 *
	 * Can be used to automatically calculate the width or height based on the original aspect ratio.
	 *
	 * @type {Number}
	 */

	static get AUTO_SIZE() {

		return AUTO_SIZE;

	}

}
