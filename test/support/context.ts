import { Input, Output, Resolution } from "postprocessing";
import type { RenderTaskContext } from "postprocessing";

export function createRenderTaskContext(): RenderTaskContext {

	return {
		input: new Input(),
		output: new Output(),
		resolution: new Resolution(),
		renderer: null,
		scene: null,
		camera: null
	};

}
