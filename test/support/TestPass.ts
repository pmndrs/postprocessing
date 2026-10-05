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

	subpasses?: TestPass[];

}

/**
 * A render task with no GPU work.
 *
 * It's used by frame-graph tests to observe scheduling and resource decisions directly.
 */

export class TestPass extends Pass {

	/**
	 * An execution seqeuence.
	 */

	readonly execution: string[];

	/**
	 * Constructs a new dummy pass for unit tests.
	 *
	 * @param options - The options.
	 */

	constructor({
		name = "unknown",
		execution = [],
		target = new RenderTargetResource(),
		bufferKey,
		requiredTextures = [],
		subpasses: subtasks
	}: TestPassOptions = {}) {

		super(name);

		this.execution = execution;
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

	/**
	 * Sets the subpasses.
	 */

	setSubpasses(...value: Pass[]) {

		this.subpasses = value;

	}

	override render(): void {

		this.execution.push(this.name);
		this.renderSubpasses();

	}

}
