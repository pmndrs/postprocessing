import { Material } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { RenderPipeline } from "../core/RenderPipeline.js";
import { ClearPass } from "../passes/ClearPass.js";

/**
 * Returns an ID for a given buffer.
 *
 * @param textureIds - A collection that maps texture UUIDs to simple ids.
 * @param buffer - A collection that maps texture UUIDs to simple ids.
 */

function toTextureId(textureIds: Map<string, number>,
	buffer: RenderTargetResource | TextureResource | null | undefined): number | null | undefined {

	if(buffer === undefined) {

		return undefined;

	}

	if(buffer === null || buffer.value === null) {

		return null;

	}

	const uuid = (buffer instanceof RenderTargetResource) ?
		buffer.value.texture.uuid :
		buffer.value.uuid;

	return textureIds.get(uuid);

}

/**
 * Creates simple texture IDs for the buffers used in a given pipeline.
 *
 * @param pipeline - A render pipeline.
 * @return A collection that maps texture UUIDs to simple ids.
 */

function createTextureIds(passes: readonly Pass<Material | null>[],
	result = new Map<string, number>(), nextId = 0): Map<string, number> {

	for(const pass of passes) {

		for(const buffer of pass.input.buffers.values()) {

			if(buffer.value !== null && !result.has(buffer.value.uuid)) {

				result.set(buffer.value.uuid, nextId++);

			}

		}

		for(const buffer of pass.output.buffers.values()) {

			if(buffer.value !== null && !result.has(buffer.value.texture.uuid)) {

				result.set(buffer.value.texture.uuid, nextId++);

			}

		}

		createTextureIds(pass.subpasses, result, nextId);

	}

	return result;

}

/**
 * Recursively analyzes a list of passes and their subpasses.
 *
 * @param passes - A list of passes.
 * @param textureIds - A collection that maps texture UUIDs to simple ids.
 */

function analyzeDataFlow(passes: readonly Pass<Material | null>[], textureIds: Map<string, number>): void {

	for(const pass of passes) {

		console.group(`${pass.name} p${pass.id}`);

		const { input, output } = pass;

		if(!pass.enabled) {

			console.debug("disabled");

		} else if(pass instanceof ClearPass) {

			console.debug("clears", toTextureId(textureIds, output.defaultBuffer));

		} else {

			if(input.buffers.size > 0) {

				const buffers = Array.from(input.buffers.values()).filter(x => x.id !== input.defaultBuffer?.id);

				if(input.hasDefaultBuffer) {

					const defaultbufferId = toTextureId(textureIds, input.defaultBuffer);
					console.debug("reads", defaultbufferId, buffers.map(x => toTextureId(textureIds, x)).join(" "));

				} else {

					console.debug("reads", buffers.map(x => toTextureId(textureIds, x)).join(" "));

				}

			}

			if(output.buffers.size > 0) {

				const buffers = Array.from(output.buffers.values()).filter(x => x.id !== output.defaultBuffer?.id);

				if(output.hasDefaultBuffer) {

					const defaultbufferId = toTextureId(textureIds, output.defaultBuffer) ?? "canvas";
					console.debug("writes", defaultbufferId, buffers.map(x => toTextureId(textureIds, x)).join(" "));

				} else {

					console.debug("writes", buffers.map(x => toTextureId(textureIds, x)).join(" "));

				}


			}

		}

		analyzeDataFlow(pass.subpasses, textureIds);
		console.groupEnd();

	}

}

/**
 * Recursively gathers input resources from a list of passes and their subpasses.
 *
 * @param passes - A list of passes.
 * @param result - A collection of resources.
 * @return The resources.
 */

function gatherInputResources(passes: readonly Pass<Material | null>[],
	result = new Set<TextureResource>()): Set<TextureResource> {

	for(const pass of passes) {

		for(const resource of pass.input.buffers.values()) {

			result.add(resource);

		}

		gatherInputResources(pass.subpasses, result);

	}

	return result;

}

/**
 * Recursively gathers output resources from a list of passes and their subpasses.
 *
 * @param passes - A list of passes.
 * @param result - A collection of resources.
 * @return The resources.
 */

function gatherOutputResources(passes: readonly Pass<Material | null>[],
	result = new Set<RenderTargetResource>()): Set<RenderTargetResource> {

	for(const pass of passes) {

		for(const resource of pass.output.buffers.values()) {

			result.add(resource);

		}

		gatherOutputResources(pass.subpasses, result);

	}

	return result;

}

/**
 * Recursively analyzes the input resources of passes and their subpasses.
 *
 * @param passes - A list of passes.
 * @param textureIds - A collection that maps texture UUIDs to simple ids.
 */

function analyzeInputResources(passes: readonly Pass<Material | null>[],
	textureIds: Map<string, number>): void {

	const resources = gatherInputResources(passes);
	const idToResources = new Map<number, TextureResource[]>();

	// Group resources by texture UUID.
	for(const resource of resources) {

		const id = toTextureId(textureIds, resource);

		if(id === null || id === undefined) {

			// Empty input resource.
			continue;

		}

		if(idToResources.has(id)) {

			idToResources.get(id)!.push(resource);

		} else {

			idToResources.set(id, [resource]);

		}

	}

	for(const [id, resources] of Array.from(idToResources).sort((a, b) => a[0] - b[0])) {

		const resource = resources[0];
		const uuid = resource.value!.uuid;
		console.debug(id, uuid);

	}

}

/**
 * Recursively analyzes the output resources of passes and their subpasses.
 *
 * @param passes - A list of passes.
 * @param textureIds - A collection that maps texture UUIDs to simple ids.
 */

function analyzeOutputResources(passes: readonly Pass<Material | null>[],
	textureIds: Map<string, number>): void {

	const resources = gatherOutputResources(passes);
	const idToResources = new Map<number, RenderTargetResource[]>();

	// Group resources by texture UUID.
	for(const resource of resources) {

		const id = toTextureId(textureIds, resource);

		if(id === null || id === undefined) {

			console.debug(id, "canvas");
			continue;

		}

		if(idToResources.has(id)) {

			idToResources.get(id)!.push(resource);

		} else {

			idToResources.set(id, [resource]);

		}

	}

	for(const [id, resources] of Array.from(idToResources).sort((a, b) => a[0] - b[0])) {

		const resource = resources[0];
		const uuid = resource.texture.value!.uuid;
		console.debug(id, uuid);

	}

}

/**
 * A collection of debug tools.
 *
 * @category Utils
 */

export class DebugTools {

	/**
	 * Logs details about a given render pipeline.
	 *
	 * @param pipeline - A render pipeline.
	 */

	static analyzePipeline(pipeline: RenderPipeline): void {

		const textureIds = createTextureIds(pipeline.passes);

		console.debug("RenderPipeline", pipeline);

		console.groupCollapsed("Data Flow");
		analyzeDataFlow(pipeline.passes, textureIds);
		console.groupEnd();

		console.groupCollapsed("Resources");
		console.group("Input Buffers");
		analyzeInputResources(pipeline.passes, textureIds);
		console.groupEnd();
		console.group("Output Buffers");
		analyzeOutputResources(pipeline.passes, textureIds);
		console.groupEnd();

		console.groupEnd();

	}

}
