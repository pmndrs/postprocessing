import { Input, Pass, RenderTargetResource } from "postprocessing";

/**
 * Options for a task used by the frame-graph tests.
 */

export interface TestPassOptions {

	/**
	 * The name of this pass.
	 */

	name?: string;

	/**
	 * An execution seqeuence.
	 */

	execution?: string[];

	/**
	 * The task's initial output target.
	 */

	target?: RenderTargetResource;

	/**
	 * The output buffer key used for the initial target.
	 */

	bufferKey?: string;

	/**
	 * Named texture inputs that must be available to this pass.
	 */

	requiredTextures?: string[];

	/**
	 * Subtasks that are executed inline by this task.
	 */

	subtasks?: TestPass[];

	/**
	 * Whether the task should execute its subtasks after recording itself.
	 */

	renderSubtasks?: boolean;

}

/**
 * A render task with no GPU work.
 *
 * It's used by frame-graph tests to observe scheduling and resource decisions directly.
 */

export class TestPass extends Pass {

	readonly execution: string[];

	private readonly renderChildren: boolean;

	constructor({
		name = "unknown",
		execution = [],
		target = new RenderTargetResource(),
		bufferKey,
		requiredTextures = [],
		subtasks,
		renderSubtasks
	}: TestPassOptions = {}) {

		super(name);

		this.execution = execution;
		this.renderChildren = renderSubtasks ?? false;
		this.requireTextures(...requiredTextures);
		this.setBuffer(bufferKey ?? Input.BUFFER_DEFAULT, target);

		if(subtasks !== undefined) {

			this.subpasses = subtasks;

		}

	}

	/**
	 * Adds an output target.
	 */

	addOutput(key: string, target: RenderTargetResource): void {

		this.setBuffer(key, target);

	}

	/**
	 * Creates and adds a default output target.
	 */

	createOutput(): RenderTargetResource {

		return this.createDefaultBuffer();

	}

	override render(): void {

		this.execution.push(this.name);

		if(this.renderChildren) {

			this.renderSubpasses();

		}

	}

}
