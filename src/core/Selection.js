import { IdManager } from "../utils/IdManager.js";

const idManager = /* @__PURE__ */ new IdManager(2);

/**
 * An object selection.
 *
 * Object selections use render layers to facilitate quick and efficient visibility changes.
 */

export class Selection extends Set {

	/**
	 * Constructs a new selection.
	 *
	 * @param {Iterable<Object3D>} [iterable] - A collection of objects that should be added to this selection.
	 * @param {Number} [layer] - A dedicated render layer for selected objects. Range is `[2, 31]`. Starts at 2 if omitted.
	 */

	constructor(iterable, layer = idManager.getNextId()) {

		super();

		/**
		 * Controls whether objects that are added to this selection should be removed from all other layers.
		 */

		this.exclusive = false;

		/**
		 * The current render layer for selected objects.
		 *
		 * @type {Number}
		 * @private
		 */

		this._layer = layer;

		if(this._layer < 1 || this._layer > 31) {

			console.warn("Layer out of range, resetting to 2");
			idManager.reset(2);
			this._layer = idManager.getNextId();

		}

		if(iterable !== undefined) {

			this.set(iterable);

		}

	}

	/**
	 * The render layer for selected objects.
	 *
	 * @type {Number}
	 */

	get layer() {

		return this._layer;

	}

	set layer(value) {

		const currentLayer = this._layer;

		for(const object of this) {

			object.layers.disable(currentLayer);
			object.layers.enable(value);

		}

		this._layer = value;

	}

	/**
	 * Returns the current render layer for selected objects.
	 *
	 * The default layer is 2. If this collides with your own custom layers, please change it before rendering!
	 *
	 * @deprecated Use layer instead.
	 * @return {Number} The layer.
	 */

	getLayer() {

		return this.layer;

	}

	/**
	 * Sets the render layer for selected objects.
	 *
	 * The current selection will be updated accordingly.
	 *
	 * @deprecated Use layer instead.
	 * @param {Number} value - The layer. Range is [0, 31].
	 */

	setLayer(value) {

		this.layer = value;

	}

	/**
	 * Indicates whether objects that are added to this selection will be removed from all other layers.
	 *
	 * @deprecated Use exclusive instead.
	 * @return {Number} Whether this selection is exclusive. Default is false.
	 */

	isExclusive() {

		return this.exclusive;

	}

	/**
	 * Controls whether objects that are added to this selection should be removed from all other layers.
	 *
	 * @deprecated Use exclusive instead.
	 * @param {Number} value - Whether this selection should be exclusive.
	 */

	setExclusive(value) {

		this.exclusive = value;

	}

	/**
	 * Clears this selection.
	 *
	 * @return {Selection} This selection.
	 */

	clear() {

		const layer = this.layer;

		for(const object of this) {

			object.layers.disable(layer);

		}

		return super.clear();

	}

	/**
	 * Clears this selection and adds the given objects.
	 *
	 * @param {Iterable<Object3D>} objects - The objects that should be selected.
	 * @return {Selection} This selection.
	 */

	set(objects) {

		this.clear();

		for(const object of objects) {

			this.add(object);

		}

		return this;

	}

	/**
	 * An alias for {@link has}.
	 *
	 * @param {Object3D} object - An object.
	 * @return {Number} Returns 0 if the given object is currently selected, or -1 otherwise.
	 * @deprecated Added for backward-compatibility.
	 */

	indexOf(object) {

		return this.has(object) ? 0 : -1;

	}

	/**
	 * Adds an object to this selection.
	 *
	 * If {@link exclusive} is set to `true`, the object will also be removed from all other layers.
	 *
	 * @param {Object3D} object - The object that should be selected.
	 * @return {Selection} This selection.
	 */

	add(object) {

		if(this.exclusive) {

			object.layers.set(this.layer);

		} else {

			object.layers.enable(this.layer);

		}

		return super.add(object);

	}

	/**
	 * Removes an object from this selection.
	 *
	 * @param {Object3D} object - The object that should be deselected.
	 * @return {Boolean} Returns true if an object has successfully been removed from this selection; otherwise false.
	 */

	delete(object) {

		if(this.has(object)) {

			object.layers.disable(this.layer);

		}

		return super.delete(object);

	}

	/**
	 * Removes an existing object from the selection. If the object doesn't exist it's added instead.
	 *
	 * @param {Object3D} object - The object.
	 * @return {Boolean} Returns true if the object is added, false otherwise.
	 */

	toggle(object) {

		let result;

		if(this.has(object)) {

			this.delete(object);
			result = false;

		} else {

			this.add(object);
			result = true;

		}

		return result;

	}

	/**
	 * Sets the visibility of all selected objects.
	 *
	 * This method enables or disables render layer 0 of all selected objects.
	 *
	 * @param {Boolean} visible - Whether the selected objects should be visible.
	 * @return {Selection} This selection.
	 */

	setVisible(visible) {

		for(const object of this) {

			if(visible) {

				object.layers.enable(0);

			} else {

				object.layers.disable(0);

			}

		}

		return this;

	}

}
