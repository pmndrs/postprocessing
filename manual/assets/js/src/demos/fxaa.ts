import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	FXAAEffect,
	GeometryPass,
	MixBlendFunction,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as CornellBox from "../objects/CornellBox.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("sunset"), (t) => {

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
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky")!;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const effect = new FXAAEffect();
	effect.blendMode.blendFunction = new MixBlendFunction();

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera),
		new EffectPass(effect, new ToneMappingEffect())
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "samples", { min: 0, max: 24, step: 1 });
	folder.addBinding(effect, "minEdgeThreshold", { min: 0.01, max: 0.3, step: 1e-4 });
	folder.addBinding(effect, "maxEdgeThreshold", { min: 0.01, max: 0.5, step: 1e-4 });
	folder.addBinding(effect, "subpixelQuality", { min: 0, max: 1.0, step: 1e-4 });
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

	function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

	}

	pipeline.compile().then(() => {

		// Only render when the canvas is visible.
		const viewportObserver = new IntersectionObserver(
			(entries) => renderer.setAnimationLoop(entries[0].isIntersecting ? render : null),
			{ threshold: 0.75 }
		);

		container.prepend(renderer.domElement);
		viewportObserver.observe(container);

	}).catch((e) => console.error(e));

}));
