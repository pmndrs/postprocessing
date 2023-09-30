import {
	CubeTextureLoader,
	FogExp2,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	WebGLRenderer
} from "three";

import {
	// BloomEffect,
	EffectPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, getSkyboxUrls } from "../utils/index.js";
import * as Checkerboard from "../objects/Checkerboard.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(getSkyboxUrls("space-00"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		gltfLoader.load(`${document.baseURI}models/emissive-strength-test/EmissiveStrengthTest.gltf`,
			(gltf) => assets.set("emissive-strength-test", gltf));

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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.025;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1, 2);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = new FogExp2(0x000000, 0.025);
	scene.add(Checkerboard.createEnvironment());

	const model = assets.get("emissive-strength-test") as GLTF;
	scene.add(model.scene);

	// Post Processing

	/*
	const effect = new BloomEffect({
		luminanceThreshold: 0.1,
		luminanceSmoothing: 0.3,
		intensity: 1.0
	});

	const geoPass = new GeometryPass(scene, camera, {
		frameBufferType: HalfFloatType,
		samples: 4
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(geoPass);
	pipeline.addPass(new EffectPass(effect));
	*/

	// Object Picking

	/*
	const ndc = new Vector2();
	const raycaster = new Raycaster();
	renderer.domElement.addEventListener("pointerdown", (event) => {

		const clientRect = container.getBoundingClientRect();
		const clientX = event.clientX - clientRect.left;
		const clientY = event.clientY - clientRect.top;
		ndc.x = (clientX / container.clientWidth) * 2.0 - 1.0;
		ndc.y = -(clientY / container.clientHeight) * 2.0 + 1.0;
		raycaster.setFromCamera(ndc, camera);
		const intersects = raycaster.intersectObjects(orbs.children, true);

		if(intersects.length > 0) {

			effect.selection.toggle(intersects[0].object);

		}

	});
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.registerPlugin(EssentialsPlugin);
	const fpsMeter = pane.addBlade({ view: "fpsgraph", label: "FPS", rows: 2 }) as EssentialsPlugin.FpsGraphBladeApi;

	/*
	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "intensity", { min: 0, max: 10, step: 0.01 });
	folder.addBinding(effect.mipmapBlurPass, "radius", { min: 0, max: 1, step: 1e-3 });
	folder.addBinding(effect.mipmapBlurPass, "levels", { min: 1, max: 9, step: 1 });

	let subfolder = folder.addFolder({ title: "Luminance Filter" });
	subfolder.addBinding(effect.luminancePass, "enabled");
	subfolder.addBinding(effect.luminanceMaterial, "threshold", { min: 0, max: 1, step: 0.01 });
	subfolder.addBinding(effect.luminanceMaterial, "smoothing", { min: 0, max: 1, step: 0.01 });

	subfolder = folder.addFolder({ title: "Selection" });
	subfolder.addBinding(effect, "inverted");
	subfolder.addBinding(effect, "ignoreBackground");

	folder.addBinding(effect.blendMode, "opacity", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect.blendMode, "blendFunction", { options: BlendFunction });
	*/

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		// pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsMeter.begin();
		controls.update(timestamp);
		// pipeline.render(timestamp);
		fpsMeter.end();
		requestAnimationFrame(render);

	});

}));
