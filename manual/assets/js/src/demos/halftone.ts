import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	HalftoneEffect,
	HalftoneShape,
	RenderPipeline,
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

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-01", ".jpg"), (t) => {

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
	controls.position.set(0, 2, 0);
	controls.lookAt(1, 2, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky")!;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	// Post Processing

	const effect = new HalftoneEffect({
		shape: HalftoneShape.LINE,
		radius: 7.073,
		rotation: Math.PI / 4
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(effect, new ToneMappingEffect())
	);

	// Settings

	const params = { rotation: effect.rotationR };

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "shape", { options: Utils.enumToRecord(HalftoneShape) });
	folder.addBinding(effect, "radius", { min: 1, max: 25, step: 1e-3 });
	folder.addBinding(effect, "samples", { min: 1, max: 24, step: 1 });
	folder.addBinding(effect, "scatterFactor", { min: 0, max: 1, step: 1e-3 });

	const subfolder = folder.addFolder({ title: "Rotation", expanded: false });
	const bindingR = subfolder.addBinding(effect, "rotationR", { min: 0, max: Math.PI, step: 1e-4 });
	const bindingG = subfolder.addBinding(effect, "rotationG", { min: 0, max: Math.PI, step: 1e-4 });
	const bindingB = subfolder.addBinding(effect, "rotationB", { min: 0, max: Math.PI, step: 1e-4 });

	folder.addBinding(params, "rotation", { min: 0, max: Math.PI, step: 1e-4 }).on("change", (e) => {

		effect.rotation = e.value;

		bindingR.refresh();
		bindingG.refresh();
		bindingB.refresh();

	});

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
