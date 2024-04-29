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
	 * Triggers when this resource's value has changed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

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
	 * Constructs a new resource wrapper.
	 *
	 * @param value - A resource value.
	 */

	constructor(value: T | null) {

		super();

		this.id = Resource.idManager.getNextId();
		this._value = value;

	}

	/**
	 * The value of this resource.
	 */

	get value(): T | null {

		return this._value;

	}

	set value(value: T | null) {

		this._value = value;
		this.dispatchEvent({ type: Resource.EVENT_CHANGE });

	}

}
