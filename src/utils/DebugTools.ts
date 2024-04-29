import { RenderPipeline } from "../core/RenderPipeline.js";
import { ClearPass } from "../passes/ClearPass.js";

/**
 * A collection of debug tools.
 *
 * @category Utils
 */

export abstract class DebugTools {

	/**
	 * Logs details about a given render pipeline.
	 *
	 * @param pipeline - A render pipeline.
	 */

	static analyzePipeline(pipeline: RenderPipeline): void {

		console.debug("RenderPipeline", pipeline);
		console.groupCollapsed("Data Flow");

		for(const pass of pipeline.passes) {

			console.group(`${pass.name} #${pass.id}`);

			const { input, output } = pass;

			if(!pass.enabled) {

				console.debug("disabled");

			} else if(pass instanceof ClearPass) {

				console.debug("clears", output.defaultBuffer?.id);

			} else {

				if(input.buffers.size > 1) {

					const defaultBufferId = input.defaultBuffer?.id;
					const otherBuffers = Array.from(input.buffers.values()).filter(x => x.id !== defaultBufferId);
					console.debug("reads", input.defaultBuffer?.id, otherBuffers.map(x => x.id).join(", "));

				} else if(input.buffers.size > 0) {

					console.debug("reads", input.defaultBuffer?.id);

				}

				if(output.buffers.size > 1) {

					const defaultBufferId = output.defaultBuffer?.id;
					const otherBuffers = Array.from(output.buffers.values()).filter(x => x.id !== defaultBufferId);
					console.debug("writes", output.defaultBuffer?.id, otherBuffers.map(x => x.id).join(", "));

				} else if(output.buffers.size > 0) {

					console.debug("writes", output.defaultBuffer?.id);

				}

			}

			console.groupEnd();

		}

		console.groupEnd();
		console.groupCollapsed("Resources");

		console.group("Input Buffers");

		for(const pass of pipeline.passes) {

			for(const resource of pass.input.buffers.values()) {

				console.debug(resource.id, resource.value?.uuid);

			}

		}

		console.groupEnd();
		console.group("Output Buffers");

		for(const pass of pipeline.passes) {

			for(const resource of pass.output.buffers.values()) {

				console.debug(resource.id, "→", resource.texture.id, resource.texture.value?.uuid);

			}

		}

		console.groupEnd();
		console.groupEnd();

	}

}
