/**
 * A task.
 *
 * @category Core
 */

export interface Task {

	/**
	 * The name of this task.
	 */

	name: string;

	/**
	 * Indicates whether this task is enabled.
	 *
	 * @defaultValue true
	 */

	enabled: boolean;

	/**
	 * Executes this task.
	 */

	execute(): void;

}
