import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	Texture,
	Vector2,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	LensDistortionEffect,
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
	controls.position.set(0, 0.5, 10);
	controls.lookAt(0, 1.5, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky")!;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	// Post Processing

	const effect = new LensDistortionEffect({
		distortion: new Vector2(0.15, 0.15),
		focalLength: new Vector2(0.75, 0.75)
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(effect, new ToneMappingEffect())
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "skew", { min: -Math.PI * 2, max: Math.PI * 2, step: 1e-3 });

	folder.addBinding(effect, "distortion", {
		x: { min: -1, max: 1, step: 1e-3 },
		y: { min: -1, max: 1, step: 1e-3 }
	});

	folder.addBinding(effect, "principalPoint", {
		x: { min: -1, max: 1, step: 1e-3 },
		y: { min: -1, max: 1, step: 1e-3 }
	});

	folder.addBinding(effect, "focalLength", {
		x: { min: 0, max: 2, step: 1e-3 },
		y: { min: 0, max: 2, step: 1e-3 }
	});

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
