import { Pass, RenderTargetResource } from "postprocessing";
import type { LoadOp, RenderTargetWrite } from "postprocessing";

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
	 * The load operation for the initial target.
	 */

	loadOp?: LoadOp;

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

	private readonly writes: RenderTargetWrite[];
	private readonly renderChildren: boolean;

	constructor({
		name = "unknown",
		execution = [],
		target,
		bufferKey,
		loadOp,
		subtasks,
		renderSubtasks
	}: TestPassOptions = {}) {

		super(name);

		this.execution = execution;
		this.writes = [];
		this.renderChildren = renderSubtasks ?? false;

		if(target !== undefined) {

			const key = bufferKey ?? "BUFFER_DEFAULT";
			this.output.setBuffer(key, target);
			this.writes.push({
				target: target,
				loadOp: loadOp ?? "load"
			});

		}

		if(subtasks !== undefined) {

			this.subpasses = subtasks;

		}

	}

	/**
	 * Adds an output target and its write declaration.
	 */

	addOutput(key: string, target: RenderTargetResource, loadOp: LoadOp = "load"): void {

		this.output.setBuffer(key, target);
		this.writes.push({ target, loadOp });

	}

	/**
	 * Creates and adds a default output target.
	 */

	createOutput(loadOp: LoadOp = "load"): RenderTargetResource {

		const target = this.output.createDefaultBuffer();
		this.writes.push({ target, loadOp });
		return target;

	}

	/**
	 * Connects an input to a producer output while making the selected buffer required.
	 *
	 * The matching key is intentional: it mirrors the existing Input.connect(Output) API used by real passes.
	 */

	readFrom(producer: TestPass, key = "BUFFER_DEFAULT"): void {

		this.input.requiredTextures.add(key);
		this.input.connect(producer.output);

	}

	/**
	 * Adds an imported texture input.
	 */

	readImported(key: string, texture: import("three").Texture): void {

		this.input.requiredTextures.add(key);
		this.input.setBuffer(key, texture);

	}

	override getRenderTargetWrites(): RenderTargetWrite[] {

		return this.writes;

	}

	override render(): void {

		this.execution.push(this.name);

		if(this.renderChildren) {

			this.renderSubpasses();

		}

	}

}
