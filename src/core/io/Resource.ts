import { EventDispatcher } from "three";
import { IdManager } from "../../utils/IdManager.js";
import { Identifiable } from "../Identifiable.js";
import { BaseEventMap } from "../BaseEventMap.js";
import type { Output } from "./Output.js";

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

	// #region Backing Data

	/**
	 * @see {@link value}
	 */

	private _value: T;

	/**
	 * @see {@link owner}
	 */

	private _owner: Output | null;

	// #endregion

	/**
	 * Constructs a new resource wrapper.
	 *
	 * @param value - A resource value.
	 */

	constructor(value: T) {

		super();

		this.id = Resource.idManager.getNextId();
		this._value = value;
		this._owner = null;

	}

	// #region Accessors

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

	// #region Internal

	/**
	 * The current owner of this resource.
	 *
	 * @internal
	 */

	get owner(): Output | null {

		return this._owner;

	}

	set owner(value: Output | null) {

		this._owner = value;

	}

	// #endregion

	// #endregion

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

}
