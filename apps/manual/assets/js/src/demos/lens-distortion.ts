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
	EffectPass,
	FrameGraph,
	GeometryPass,
	LensDistortionEffect,
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

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1.5, 3);
	controls.lookAt(0, 1.25, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky")!;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());
	scene.add(DefaultEnvironment.createLights());

	// Post-Processing

	const effect = new LensDistortionEffect({
		distortion: new Vector2(-0.2, -0.2),
		focalLength: new Vector2(1, 1)
	});

	const geoPass = new GeometryPass({ samples: 4 });
	const effectPass = new EffectPass(effect, new ToneMappingEffect());
	effectPass.read(geoPass);

	const frameGraph = new FrameGraph({ renderer, scene, camera });
	frameGraph.add(geoPass, effectPass);
	frameGraph.output(effectPass);

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

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		frameGraph.render(timestamp);
		fpsGraph.end();

	}

	frameGraph.compile().then(() => {

		// Only render when the canvas is visible.
		const viewportObserver = new IntersectionObserver(
			(entries) => renderer.setAnimationLoop(entries[0].isIntersecting ? render : null),
			{ threshold: 0.75 }
		);

		container.prepend(renderer.domElement);
		viewportObserver.observe(container);

	}).catch((e) => console.error(e));

}));
