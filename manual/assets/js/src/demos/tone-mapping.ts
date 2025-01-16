import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	ShaderChunk,
	Texture,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	MixBlendFunction,
	RenderPipeline,
	ToneMapping,
	ToneMappingEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import * as DefaultEnvironment from "../objects/DefaultEnvironment.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => void load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.debug.checkShaderErrors = Utils.isLocalhost;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1.5, 10);
	controls.lookAt(0, 1.35, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky")!;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	// Custom Tone Mapping Example

	ShaderChunk.tonemapping_pars_fragment = ShaderChunk.tonemapping_pars_fragment.replace(
		// Replace the standard function
		"vec3 CustomToneMapping( vec3 color ) { return color; }",
		// with a custom one such as Uncharted 2 Filmic
		"vec3 uncharted2_tonemap_partial(vec3 x){float A=0.15;float B=0.5;float C=0.1;float D=0.2;float E=0.0;" +
		"float F=0.3;return((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;}vec3 uncharted2_filmic(vec3 v){" +
		"vec3 curr=uncharted2_tonemap_partial(v*toneMappingExposure);vec3 W=vec3(11.2);" +
		"vec3 white_scale=vec3(1.0)/uncharted2_tonemap_partial(W);return curr*white_scale;}" +
		"vec3 CustomToneMapping(vec3 c){return uncharted2_filmic(c);}"
	);

	// Post Processing

	const effect = new ToneMappingEffect();
	effect.blendMode.blendFunction = new MixBlendFunction();

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(effect)
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);
	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(renderer, "toneMappingExposure", { min: 0, max: 4, step: 1e-3 });
	folder.addBinding(effect, "toneMapping", { options: Utils.enumToRecord(ToneMapping) });
	Utils.addBlendModeBindings(folder, effect.blendMode);

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth;
		const height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	pipeline.compile().then(() => {

		container.prepend(renderer.domElement);

		renderer.setAnimationLoop((timestamp) => {

			fpsGraph.begin();
			controls.update(timestamp);
			pipeline.render(timestamp);
			fpsGraph.end();

		});

	}).catch((e) => console.error(e));

}));
