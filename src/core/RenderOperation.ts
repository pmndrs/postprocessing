import { Compilable } from "./Compilable.js";
import { Disposable } from "./Disposable.js";
import { RenderTaskContext } from "./RenderTaskContext.js";
import { Task } from "./Task.js";

/**
 * An inline render operation.
 *
 * @category Core
 */

export abstract class RenderOperation implements Compilable, Disposable, Task {

	// #region Backing Data

	/**
	 * @see {@link name}
	 */

	private _name: string;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	// #endregion

	/**
	 * The context of the parent render task.
	 */

	protected readonly context: Readonly<RenderTaskContext>;

	/**
	 * Constructs a new render operation.
	 *
	 * @param name - The name of the operation.
	 * @param context - The context of the parent render task.
	 */

	constructor(name: string, context: Readonly<RenderTaskContext>) {

		this._name = name;
		this._enabled = true;
		this.context = context;

	}

	// #region Accessors

	get name(): string {

		return this._name;

	}

	protected set name(value: string) {

		this._name = value;

	}

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		this._enabled = value;

	}

	// #endregion

	async compile(): Promise<void> {}

	abstract execute(): void;

	dispose(): void {}

}
