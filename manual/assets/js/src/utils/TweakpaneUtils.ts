import { FolderApi, Pane } from "tweakpane";
import { EssentialsPlugin, FpsGraphBladeApi } from "@tweakpane/plugin-essentials";
import { BlendMode } from "postprocessing";
import { blendFunctions } from "./blendFunctions.js";

/**
 * Creates an FPS graph that automatically adjusts the max FPS.
 *
 * @param pane - A pane.
 * @return The graph.
 */

export function createFPSGraph(pane: Pane): FpsGraphBladeApi {

	pane.registerPlugin(EssentialsPlugin);

	const fpsGraph = pane.addBlade({ view: "fpsgraph", rows: 2 }) as FpsGraphBladeApi;
	fpsGraph.on("tick", () => {

		if(fpsGraph.fps === null) {

			return;

		}

		const max = Math.round(fpsGraph.fps) * 1.5;

		if(max > fpsGraph.max) {

			fpsGraph.max = max;

		}

	});

	return fpsGraph;

}

/**
 * Registers blend mode bindings.
 *
 * @param pane - A pane.
 * @return The graph.
 */

export function addBlendModeBindings(pane: Pane | FolderApi, blendMode: BlendMode): void {

	const proxy = { blendFunction: blendMode.blendFunction.name };
	pane.addBinding(blendMode, "opacity", { min: 0, max: 1, step: 1e-3 });
	pane.addBinding(proxy, "blendFunction", { options: arrayToRecord(Object.keys(blendFunctions)) })
		.on("change", (e) => blendMode.blendFunction = blendFunctions[e.value]);

}

/**
 * Converts an array into a record object.
 *
 * @param value - An array.
 * @return The record.
 */

export function arrayToRecord<T extends number | string | symbol>(value: T[]): Record<T, T> {

	return value.reduce((a: Record<T, T>, b: T) => {

		a[b] = b;
		return a;

	}, {} as Record<T, T>);

}

/**
 * Converts an enum into a record object.
 *
 * @param value - An enum.
 * @return The record.
 */

export function enumToRecord(value: Record<string, string | number>): Record<string, string | number> {

	return Object.fromEntries(Object.entries(value).filter((entry) => isNaN(Number(entry[0]))));

}
