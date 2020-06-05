/**
 * An object selection.
 *
 * Object selections use render layers to facilitate quick and efficient
 * visibility changes.
 */

export class Selection extends Set {

	/**
	 * Constructs a new selection.
	 *
	 * @param {Iterable<Object3D>} [iterable] - A collection of objects that should be added to this selection.
	 * @param {Number} [layer=10] - A dedicated render layer for selected objects.
	 */

	constructor(iterable, layer = 10) {

		super();

		/**
		 * The current render layer for selected objects.
		 *
		 * @type {Number}
		 * @private
		 */

		this.currentLayer = layer;

		if(iterable !== undefined) {

			this.set(iterable);

		}

	}

	/**
	 * A dedicated render layer for selected objects.
	 *
	 * This layer is set to 10 by default. If this collides with your own custom
	 * layers, please change it to a free layer before rendering!
	 *
	 * @type {Number}
	 */

	get layer() {

		return this.currentLayer;

	}

	/**
	 * Sets the render layer of selected objects.
	 *
	 * The current selection will be updated accordingly.
	 *
	 * @type {Number}
	 */

	set layer(value) {

		const currentLayer = this.currentLayer;

		for(const object of this) {

			object.layers.disable(currentLayer);
			object.layers.enable(value);

		}

		this.currentLayer = value;

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
	 * @param {Iterable<Object3D>} objects - The objects that should be selected. This array will be copied.
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
	 * @deprecated Added for backward compatibility. Use has instead.
	 */

	indexOf(object) {

		return this.has(object) ? 0 : -1;

	}

	/**
	 * Adds an object to this selection.
	 *
	 * @param {Object3D} object - The object that should be selected.
	 * @return {Selection} This selection.
	 */

	add(object) {

		object.layers.enable(this.layer);
		super.add(object);

		return this;

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
