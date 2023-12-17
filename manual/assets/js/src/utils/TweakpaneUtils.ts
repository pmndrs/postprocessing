import { Pane } from "tweakpane";
import { FpsGraphBladeApi } from "@tweakpane/plugin-essentials";

/**
 * Creates an FPS graph that automatically adjusts the max FPS.
 * Requires the Tweakpane Essentials plugin to be registered.
 *
 * @param pane - A pane.
 * @return The graph.
 */

export function createFPSGraph(pane: Pane): FpsGraphBladeApi {

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
