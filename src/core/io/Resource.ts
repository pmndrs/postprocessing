import { EventDispatcher } from "three";
import { IdManager } from "../../utils/IdManager.js";
import { Identifiable } from "../Identifiable.js";
import { BaseEventMap } from "../BaseEventMap.js";

/**
 * A resource.
 *
 * @param T - The type of the internal value.
 * @category IO
 */

export class Resource<T = unknown> extends EventDispatcher<BaseEventMap> implements Identifiable {

	/**
	 * An ID manager.
	 */

	private static readonly idManager = /* @__PURE__ */ new IdManager();

	readonly id: number;

	/**
	 * @see {@link value}
	 */

	private _value: T;

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

	get value(): T {

		return this._value;

	}

	set value(value: T) {

		if(this._value === value) {

			return;

		}

		this._value = value;
		this.setChanged();

	}

	/**
	 * Dispatches a `change` event.
	 */

	setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

}
