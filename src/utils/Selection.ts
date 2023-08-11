import { Object3D } from "three";

/**
 * An object selection.
 *
 * Object selections use render layers to facilitate quick and efficient visibility changes.
 *
 * @group Utils
 */

export class Selection extends Set<Object3D> {

	/**
	 * @see {@link layer}
	 */

	private _layer: number;

	/**
	 * Indicates whether this selection is enabled.
	 */

	enabled: boolean;

	/**
	 * Controls whether objects that are added to this selection should be removed from all other layers.
	 */

	exclusive: boolean;

	/**
	 * Constructs a new selection.
	 *
	 * @param iterable - A collection of objects that should be added to this selection.
	 * @param layer - A dedicated render layer for selected objects. Default is 10.
	 */

	constructor(iterable?: Iterable<Object3D>, layer = 10) {

		super();

		this._layer = layer;
		this.enabled = true;
		this.exclusive = false;

		if(iterable !== undefined) {

			this.set(iterable);

		}

	}

	/**
	 * The render layer for selected objects.
	 */

	get layer(): number {

		return this._layer;

	}

	set layer(value: number) {

		const currentLayer = this._layer;

		for(const object of this) {

			object.layers.disable(currentLayer);
			object.layers.enable(value);

		}

		this._layer = value;

	}

	/**
	 * Clears this selection.
	 */

	override clear(): void {

		const layer = this.layer;

		for(const object of this) {

			object.layers.disable(layer);

		}

		return super.clear();

	}

	/**
	 * Adds an object to this selection.
	 *
	 * If {@link exclusive} is set to `true`, the object will also be removed from all other layers.
	 *
	 * @param object - The object that should be selected.
	 * @return This selection.
	 */

	override add(object: Object3D): this {

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
	 * @param object - The object that should be deselected.
	 * @return Returns true if an object has successfully been removed from this selection; otherwise false.
	 */

	override delete(object: Object3D): boolean {

		if(this.has(object)) {

			object.layers.disable(this.layer);

		}

		return super.delete(object);

	}

	/**
	 * Clears this selection and adds the given objects.
	 *
	 * @param objects - The objects that should be selected.
	 * @return This selection.
	 */

	set(objects: Iterable<Object3D>): this {

		this.clear();

		for(const object of objects) {

			this.add(object);

		}

		return this;

	}

	/**
	 * Removes an existing object from the selection. If the object doesn't exist it's added instead.
	 *
	 * @param object - The object.
	 * @return Returns true if the object is added, false otherwise.
	 */

	toggle(object: Object3D): boolean {

		let result: boolean;

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
	 * @param visible - Whether the selected objects should be visible.
	 * @return This selection.
	 */

	setVisible(visible: boolean): this {

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
