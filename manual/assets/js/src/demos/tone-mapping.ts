import {
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	ToneMappingEffect,
	ToneMappingMode
} from "postprocessing";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { toRecord } from "../utils/ArrayUtils.js";
import * as Domain from "../objects/Domain.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path = document.baseURI + "img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(urls, (t) => {

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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const effect = new ToneMappingEffect({
		blendFunction: BlendFunction.NORMAL,
		mode: ToneMappingMode.REINHARD2_ADAPTIVE,
		resolution: 256,
		whitePoint: 16.0,
		middleGrey: 0.6,
		minLuminance: 0.01,
		averageLuminance: 0.01,
		adaptationRate: 1.0
	});

	const pipeline = new RenderPipeline(renderer);
	const effectPass = new EffectPass(effect);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(effectPass);

	// Settings

	const lumMaterial = effect.adaptiveLuminanceMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.registerPlugin(EssentialsPlugin);
	const fpsMeter = pane.addBlade({ view: "fpsgraph", label: "FPS", rows: 2 }) as EssentialsPlugin.FpsGraphBladeApi;

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(renderer, "toneMappingExposure", { min: 0, max: 2, step: 1e-3 });
	folder.addBinding(effect, "mode", { options: ToneMappingMode });

	let subfolder = folder.addFolder({ title: "Reinhard2" });
	subfolder.addBinding(effect, "whitePoint", { min: 1, max: 20, step: 1e-2 });
	subfolder.addBinding(effect, "middleGrey", { min: 0, max: 1, step: 1e-4 });
	subfolder.addBinding(effect, "averageLuminance", { min: 1e-4, max: 1, step: 1e-3 });
	subfolder = subfolder.addFolder({ title: "Adaptive" });
	subfolder.addBinding(effect, "resolution", {
		options: toRecord([64, 128, 256, 512]),
		label: "resolution"
	});

	subfolder.addBinding(lumMaterial, "minLuminance", { min: 0, max: 3, step: 1e-3 });
	subfolder.addBinding(lumMaterial, "adaptationRate", { min: 0, max: 3, step: 1e-3 });

	folder.addBinding(effectPass, "dithering");
	folder.addBinding(effect.blendMode, "opacity", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect.blendMode, "blendFunction", { options: BlendFunction });

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsMeter.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsMeter.end();
		requestAnimationFrame(render);

	});

}));
