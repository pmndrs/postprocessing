import { Material } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { FrameGraph } from "../core/FrameGraph.js";

/**
 * Returns the texture IDs of the given buffer.
 *
 * @param textureIds - A collection that maps texture UUIDs to simple ids.
 * @param buffer - A collection that maps texture UUIDs to simple ids.
 * @return The IDs.
 */

function getTextureIds(textureIds: Map<string, number>,
	buffer: RenderTargetResource | TextureResource | null | undefined): number[] {

	if(buffer === undefined || buffer === null || buffer.value === null) {

		return [];

	}

	if(buffer instanceof TextureResource) {

		return [textureIds.get(buffer.value.uuid)!];

	}

	const textures = buffer.value.depthTexture !== null ?
		buffer.value.textures.concat([buffer.value.depthTexture]) :
		buffer.value.textures;

	return textures.map(x => textureIds.get(x.uuid)!);

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

			if(buffer.value === null) {

				continue;

			}

			for(const texture of buffer.value.textures) {

				if(!result.has(texture.uuid)) {

					result.set(texture.uuid, nextId++);

				}

			}

			if(buffer.value.depthTexture !== null && !result.has(buffer.value.depthTexture.uuid)) {

				result.set(buffer.value.depthTexture.uuid, nextId++);

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

		} else {

			if(input.buffers.size > 0) {

				const buffers = Array.from(input.buffers.values()).filter(x => x.id !== input.defaultBuffer?.id);

				if(input.defaultBuffer !== undefined) {

					const defaultbufferId = getTextureIds(textureIds, input.defaultBuffer)[0];
					console.debug("reads", defaultbufferId, buffers.map(x => getTextureIds(textureIds, x)[0]).join(" "));

				} else {

					console.debug("reads", buffers.map(x => getTextureIds(textureIds, x)[0]).join(" "));

				}

			}

			if(output.buffers.size > 0) {

				const buffers = Array.from(output.buffers.values()).filter(x => x.id !== output.defaultBuffer?.id);

				const additionalBuffers = buffers
					.map(x => getTextureIds(textureIds, x))
					.reduce((a, b) => [...a, ...b], [])
					.join(" ");

				if(output.defaultBuffer !== undefined) {

					const defaultbufferIds = getTextureIds(textureIds, output.defaultBuffer);

					if(defaultbufferIds.length > 0) {

						console.debug("writes", ...defaultbufferIds, additionalBuffers);

					} else {

						console.debug("writes", "canvas", additionalBuffers);

					}

				} else {

					console.debug("writes", additionalBuffers);

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

		const ids = getTextureIds(textureIds, resource);

		if(ids.length === 0) {

			// Empty input resource.
			continue;

		}

		// Texture resources only contain a single texture.
		if(idToResources.has(ids[0])) {

			idToResources.get(ids[0])!.push(resource);

		} else {

			idToResources.set(ids[0], [resource]);

		}

	}

	for(const [id, resources] of Array.from(idToResources).sort((a, b) => a[0] - b[0])) {

		const resource = resources[0];
		const texture = resource.value!;
		console.debug(id, texture.uuid, texture.name);

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
	const uniqueResources = new Map<number, RenderTargetResource>();

	// Deduplicate resources based on their ID.
	for(const resource of resources) {

		uniqueResources.set(resource.id, resource);

	}

	for(const resource of Array.from(uniqueResources.values()).sort((a, b) => a.id - b.id)) {

		console.group(`rt${resource.id}`);

		if(resource.value === null) {

			console.debug(null, "canvas");

		} else {

			for(const texture of resource.value.textures) {

				console.debug(textureIds.get(texture.uuid), texture.uuid, texture.name);

			}

			if(resource.value.depthTexture !== null) {

				const texture = resource.value.depthTexture;
				console.debug(textureIds.get(texture.uuid), texture.uuid, texture.name);

			}

		}

		console.groupEnd();

	}

}

/**
 * A collection of debug tools.
 *
 * @category Utils
 */

export class DebugTools {

	/**
	 * Logs details about a given frame graph.
	 *
	 * @param graph - A frame graph.
	 */

	static analyzePipeline(graph: FrameGraph): void {

		//const textureIds = createTextureIds(graph.passes);

		//console.debug("RenderPipeline", graph);

		//console.groupCollapsed("Data Flow");
		//analyzeDataFlow(graph.passes, textureIds);
		//console.groupEnd();

		//console.groupCollapsed("Resources");
		//console.group("Input Textures");
		//analyzeInputResources(graph.passes, textureIds);
		//console.groupEnd();
		//console.group("Output Render Targets");
		//analyzeOutputResources(graph.passes, textureIds);
		//console.groupEnd();

		//console.groupEnd();

	}

}
