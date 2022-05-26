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
	 * @param {Resizable} resizeable - A resizable object.
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

		this.base = new Vector2(1, 1);

		/**
		 * The preferred resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.preferred = new Vector2(width, height);

		/**
		 * The preferred resolution.
		 *
		 * @type {Vector2}
		 * @deprecated Added for backward-compatibility.
		 */

		this.target = this.preferred;

		/**
		 * A resolution scale.
		 *
		 * @type {Number}
		 * @private
		 */

		this.s = scale;

	}

	/**
	 * The effective width.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	 *
	 * @type {Number}
	 */

	get width() {

		const { base, preferred, scale } = this;

		let result;

		if(preferred.width !== AUTO_SIZE) {

			result = preferred.width;

		} else if(preferred.height !== AUTO_SIZE) {

			result = Math.round(preferred.height * (base.width / Math.max(base.height, 1)));

		} else {

			result = Math.round(base.width * scale);

		}

		return result;

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

		const { base, preferred, scale } = this;

		let result;

		if(preferred.height !== AUTO_SIZE) {

			result = preferred.height;

		} else if(preferred.width !== AUTO_SIZE) {

			result = Math.round(preferred.width / Math.max(base.width / Math.max(base.height, 1), 1));

		} else {

			result = Math.round(base.height * scale);

		}

		return result;

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
			this.preferred.setScalar(AUTO_SIZE);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

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

		return this.base.width;

	}

	set baseWidth(value) {

		if(this.base.width !== value) {

			this.base.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * Returns the base width.
	 *
	 * @deprecated Use baseWidth instead.
	 * @return {Number} The base width.
	 */

	getBaseWidth() {

		return this.base.width;

	}

	/**
	 * Sets the base width.
	 *
	 * @deprecated Use baseWidth instead.
	 * @param {Number} value - The width.
	 */

	setBaseWidth(value) {

		if(this.base.width !== value) {

			this.base.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * The base height.
	 *
	 * @type {Number}
	 */

	get baseHeight() {

		return this.base.height;

	}

	set baseHeight(value) {

		if(this.base.height !== value) {

			this.base.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

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

		if(this.base.width !== width || this.base.height !== height) {

			this.base.set(width, height);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * The preferred width.
	 *
	 * @type {Number}
	 */

	get preferredWidth() {

		return this.preferred.width;

	}

	set preferredWidth(value) {

		if(this.preferred.width !== value) {

			this.preferred.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

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

		return this.preferred.height;

	}

	set preferredHeight(value) {

		if(this.preferred.height !== value) {

			this.preferred.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

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

		if(this.preferred.width !== width || this.preferred.height !== height) {

			this.preferred.set(width, height);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * Copies the given resolution.
	 *
	 * @param {Resolution} resolution - The resolution.
	 */

	copy(resolution) {

		this.base.set(resolution.getBaseWidth(), resolution.getBaseHeight());
		this.preferred.set(resolution.getPreferredWidth(), resolution.getPreferredHeight());
		this.dispatchEvent({ type: "change" });
		this.resizable.setSize(this.base.width, this.base.height);

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
