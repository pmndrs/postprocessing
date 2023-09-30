import {
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	RGBAFormat,
	SRGBColorSpace,
	Scene,
	Texture,
	TextureLoader,
	WebGLRenderer
} from "three";

import {
	// ChromaticAberrationEffect,
	EffectPass,
	GeometryPass,
	// GlitchEffect,
	GlitchMode,
	NoiseTexture,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, getSkyboxUrls } from "../utils/index.js";
import * as Checkerboard from "../objects/Checkerboard.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(getSkyboxUrls("space-00"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load(`${document.baseURI}img/textures/perturb.jpg`, (t) => {

			assets.set("noise", t);

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
	container.dataset.epilepsyWarning = "1";
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
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = new FogExp2(0x000000, 0.025);
	scene.add(Checkerboard.createEnvironment());

	// Post Processing

	/*
	const chromaticAberrationEffect = new ChromaticAberrationEffect();
	const effect = new GlitchEffect({ perturbationMap: assets.get("noise") });
	effect.input.uniforms.set(GlitchEffect.INPUT_UNIFORM_OFFSET, chromaticAberrationEffect.offset); // optional

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));
	pipeline.addPass(new EffectPass(chromaticAberrationEffect));
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.registerPlugin(EssentialsPlugin);
	const fpsMeter = pane.addBlade({ view: "fpsgraph", label: "FPS", rows: 2 }) as EssentialsPlugin.FpsGraphBladeApi;

	/*
	const noiseTexture = new NoiseTexture(64, 64, RGBAFormat);
	const params = {
		"custom pattern": true
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "mode", { options: GlitchMode });
	folder.addBinding(effect, "minDelay", { min: 0, max: 2, step: 0.01 });
	folder.addBinding(effect, "maxDelay", { min: 2, max: 4, step: 0.01 });
	folder.addBinding(effect, "minDuration", { min: 0, max: 0.6, step: 0.01 });
	folder.addBinding(effect, "maxDuration", { min: 0.6, max: 1.8, step: 0.01 });
	folder.addBinding(effect, "minStrength", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "maxStrength", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "ratio", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "columns", { min: 0, max: 0.5, step: 0.01 });
	folder.addBinding(params, "custom pattern")
		.on("change", (e) => effect.perturbationMap = (e.value ? assets.get("noise") : noiseTexture));
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
