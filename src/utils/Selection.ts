import { Object3D, Object3DEventMap } from "three";
import { SetExtensions } from "./SetExtensions.js";
import { IdManager } from "./IdManager.js";

/**
 * An object selection.
 *
 * Object selections use render layers to facilitate quick and efficient visibility changes.
 *
 * @category Utils
 */

export class Selection implements Set<Object3D>, SetExtensions<Object3D> {

	/**
	 * An ID manager.
	 */

	private static readonly idManager = /* @__PURE__ */ new IdManager(2);

	/**
	 * The internal data collection.
	 */

	private data: Set<Object3D>;

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
	 * @param layer - A dedicated render layer for selected objects. Range is `[2, 31]`. Starts at 2 if omitted.
	 */

	constructor(iterable?: Iterable<Object3D> | null, layer = Selection.idManager.getNextId()) {

		this.data = new Set<Object3D>(iterable);

		this._layer = layer;

		if(this._layer < 1 || this._layer > 31) {

			console.warn("Layer out of range, resetting to 2");
			Selection.idManager.reset(2);
			this._layer = Selection.idManager.getNextId();

		}

		this.enabled = true;
		this.exclusive = false;

		if(iterable !== undefined && iterable !== null) {

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

		for(const object of this.data) {

			object.layers.disable(currentLayer);
			object.layers.enable(value);

		}

		this._layer = value;

	}

	get size(): number {

		return this.data.size;

	}

	get [Symbol.toStringTag](): string {

		return this.data[Symbol.toStringTag];

	}

	[Symbol.iterator](): SetIterator<Object3D> {

		return this.data[Symbol.iterator]();

	}

	has(value: Object3D<Object3DEventMap>): boolean {

		return this.data.has(value);

	}

	clear(): void {

		const layer = this.layer;

		for(const object of this.data) {

			object.layers.disable(layer);

		}

		this.data.clear();

	}

	/**
	 * Adds an object to this selection.
	 *
	 * If {@link exclusive} is set to `true`, the object will also be removed from all other layers.
	 *
	 * @param value - The object that should be selected.
	 * @return This selection.
	 */

	add(value: Object3D): this {

		if(this.exclusive) {

			value.layers.set(this.layer);

		} else {

			value.layers.enable(this.layer);

		}

		this.data.add(value);

		return this;

	}

	/**
	 * Adds the given objects to this selection.
	 *
	 * If {@link exclusive} is set to `true`, the objects will also be removed from all other layers.
	 *
	 * @param values - The objects that should be selected.
	 * @return This selection.
	 */

	addAll(...values: Object3D[]): this {

		for(const object of values) {

			if(this.exclusive) {

				object.layers.set(this.layer);

			} else {

				object.layers.enable(this.layer);

			}

		}

		return this;

	}

	/**
	 * Removes an object from this selection.
	 *
	 * @param value - The object that should be deselected.
	 * @return Returns true if an object has successfully been removed from this selection; otherwise false.
	 */

	delete(value: Object3D): boolean {

		if(this.data.has(value)) {

			value.layers.disable(this.layer);

		}

		return this.data.delete(value);

	}

	/**
	 * Removes the given objects from this selection.
	 *
	 * @param values - The objects that should be deselected.
	 * @return This selection.
	 */

	deleteAll(...values: Object3D[]): this {

		for(const object of values) {

			if(this.data.has(object)) {

				object.layers.disable(this.layer);

			}

		}

		return this;

	}

	/**
	 * Clears this selection and adds the given objects.
	 *
	 * @param values - The objects that should be selected.
	 * @return This selection.
	 */

	set(values: Iterable<Object3D>): this {

		this.clear();
		this.addAll(...values);
		return this;

	}

	/**
	 * Removes an existing object from the selection. If the object doesn't exist it's added instead.
	 *
	 * @param value - The object.
	 * @return Returns true if the object is added, false otherwise.
	 */

	toggle(value: Object3D): boolean {

		let result: boolean;

		if(this.data.has(value)) {

			this.delete(value);
			result = false;

		} else {

			this.add(value);
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

		for(const object of this.data) {

			if(visible) {

				object.layers.enable(0);

			} else {

				object.layers.disable(0);

			}

		}

		return this;

	}

	entries(): SetIterator<[Object3D, Object3D]> {

		return this.data.entries();

	}

	keys(): SetIterator<Object3D> {

		return this.data.keys();

	}

	values(): SetIterator<Object3D> {

		return this.data.values();

	}

	forEach(callbackfn: (value: Object3D, value2: Object3D, set: Set<Object3D>) => void, thisArg?: unknown): void {

		return this.data.forEach(callbackfn, thisArg);

	}

	union<U>(other: ReadonlySetLike<U>): Set<Object3D> {

		throw new Error("Method not implemented.");

	}

	intersection<U>(other: ReadonlySetLike<U>): Set<Object3D & U> {

		throw new Error("Method not implemented.");

	}

	difference<U>(other: ReadonlySetLike<U>): Set<Object3D> {

		throw new Error("Method not implemented.");

	}

	symmetricDifference<Object3D>(other: ReadonlySetLike<Object3D>): Set<Object3D> {

		throw new Error("Method not implemented.");

	}

	isSubsetOf(other: ReadonlySetLike<unknown>): boolean {

		return this.data.isSubsetOf(other);

	}

	isSupersetOf(other: ReadonlySetLike<unknown>): boolean {

		return this.data.isSupersetOf(other);

	}

	isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {

		return this.data.isDisjointFrom(other);

	}

}
