import { InOut, Input, Output, Resolution } from "postprocessing";
import type { EffectPassContext, RenderTaskContext } from "postprocessing";

export function createRenderTaskContext(): RenderTaskContext {

	return {
		in: new Input(),
		out: new Output(),
		inOut: new InOut(),
		resolution: new Resolution(),
		renderer: null,
		scene: null,
		camera: null
	};

}

export function createEffectPassContext(requiredTextures: readonly string[] = []): EffectPassContext {

	return {
		in: new Input(),
		requiredTextures
	};

}
