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
	 * @param {Number} [preferredWidth=Resolution.AUTO_SIZE] - The preferred width.
	 * @param {Number} [preferredHeight=Resolution.AUTO_SIZE] - The preferred height.
	 * @param {Number} [scale=1.0] - A resolution scale.
	 */

	constructor(resizable, width = AUTO_SIZE, height = AUTO_SIZE, scale = 1.0) {

		super();

		/**
		 * A resizable object.
		 *
		 * @type {Resizable}
		 * @deprecated Use an event listener instead.
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
		 * @deprecated
		 */

		this.target = this.preferred;

		/**
		 * A resolution scale.
		 *
		 * @type {Number}
		 * @private
		 */

		this.scale = scale;

	}

	/**
	 * The effective width.
	 *
	 * @type {Number}
	 * @deprecated Use getWidth() instead.
	 */

	get width() {

		return this.getWidth();

	}

	/**
	 * The effective height.
	 *
	 * @type {Number}
	 * @deprecated Use getHeight() instead.
	 */

	get height() {

		return this.getHeight();

	}

	/**
	 * Sets the preferred width.
	 *
	 * @type {Number}
	 * @deprecated Use setPreferredWidth() instead.
	 */

	set width(value) {

		this.setPreferredWidth(value);

	}

	/**
	 * Sets the preferred height.
	 *
	 * @type {Number}
	 * @deprecated Use setPreferredHeight() instead.
	 */

	set height(value) {

		this.setPreferredHeight(value);

	}

	/**
	 * Returns the effective width.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
	 *
	 * @return {Number} The effective width.
	 */

	getWidth() {

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

	/**
	 * Returns the effective height.
	 *
	 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
	 *
	 * @return {Number} The effective height.
	 */

	getHeight() {

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

	/**
	 * Returns the current resolution scale.
	 *
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
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		if(this.scale !== value) {

			this.scale = value;
			this.preferred.setScalar(AUTO_SIZE);
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * Returns the base width.
	 *
	 * @return {Number} The base width.
	 */

	getBaseWidth() {

		return this.base.width;

	}

	/**
	 * Sets the base width.
	 *
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
	 * Returns the base height.
	 *
	 * @return {Number} The base height.
	 */

	getBaseHeight() {

		return this.base.height;

	}

	/**
	 * Sets the base height.
	 *
	 * @param {Number} value - The height.
	 */

	setBaseHeight(value) {

		if(this.base.height !== value) {

			this.base.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

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
	 * Sets the preferred width.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based on the height and aspect ratio.
	 *
	 * @param {Number} value - The width.
	 */

	setPreferredWidth(value) {

		if(this.preferred.width !== value) {

			this.preferred.width = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

	}

	/**
	 * Sets the preferred height.
	 *
	 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based on the width and aspect ratio.
	 *
	 * @param {Number} value - The height.
	 */

	setPreferredHeight(value) {

		if(this.preferred.height !== value) {

			this.preferred.height = value;
			this.dispatchEvent({ type: "change" });
			this.resizable.setSize(this.base.width, this.base.height);

		}

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
