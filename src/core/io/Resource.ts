import { EventDispatcher } from "three";
import { IdManager } from "../../utils/IdManager.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Identifiable } from "../Identifiable.js";

/**
 * A resource wrapper base class.
 *
 * @param T - The type of the internal value.
 * @category IO
 */

export abstract class Resource<T = unknown> extends EventDispatcher<BaseEventMap> implements Identifiable {

	/**
	 * An ID manager.
	 */

	private static idManager = new IdManager();

	readonly id: number;

	/**
	 * @see {@link value}
	 */

	private _value: T | null;

	/**
	 * @see {@link overrideValue}
	 */

	private _overrideValue: T | null;

	/**
	 * Indicates whether this resource is currently locked.
	 *
	 * A resource will be locked for the duration of a `change` event dispatch.
	 */

	private locked: boolean;

	/**
	 * Constructs a new resource wrapper.
	 *
	 * @param value - A resource value.
	 */

	constructor(value: T | null) {

		super();

		this.id = Resource.idManager.getNextId();
		this._value = value;
		this._overrideValue = null;
		this.locked = false;

	}

	/**
	 * The value of this resource.
	 */

	get value(): T | null {

		return this._overrideValue ?? this._value;

	}

	set value(value: T | null) {

		this._value = value;
		this.setChanged();

	}

	/**
	 * An additional value that overrides the main {@link value}.
	 *
	 * @internal
	 */

	get overrideValue(): T | null {

		return this._overrideValue;

	}

	set overrideValue(value: T | null) {

		this._overrideValue = value;
		this.setChanged();

	}

	/**
	 * Dispatches a `change` event.
	 *
	 * @internal
	 */

	setChanged(): void {

		if(this.locked) {

			throw new Error("Unable to change resource value inside change event handler");

		}

		this.locked = true;
		this.dispatchEvent({ type: "change" });
		this.locked = false;

	}

}
