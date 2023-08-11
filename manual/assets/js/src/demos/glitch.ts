import {
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	RGBAFormat,
	SRGBColorSpace,
	Scene,
	TextureLoader,
	WebGLRenderer
} from "three";

import {
	ChromaticAberrationEffect,
	EffectPass,
	GeometryPass,
	GlitchEffect,
	GlitchMode,
	NoiseTexture,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import * as Domain from "../objects/Domain.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
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

		textureLoader.load(document.baseURI + "img/textures/perturb.jpg", (t) => {

			assets.set("noise", t);

		});

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
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const chromaticAberrationEffect = new ChromaticAberrationEffect();
	const effect = new GlitchEffect({ perturbationMap: assets.get("noise") });
	effect.input.uniforms.set(GlitchEffect.INPUT_UNIFORM_OFFSET, chromaticAberrationEffect.offset); // optional

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));
	pipeline.addPass(new EffectPass(chromaticAberrationEffect));

	// Settings

	const fpsMeter = new FPSMeter();
	const noiseTexture = new NoiseTexture(64, 64, RGBAFormat);
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = {
		"custom pattern": true
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(effect, "mode", { options: GlitchMode });
	folder.addInput(effect, "minDelay", { min: 0, max: 2, step: 0.01 });
	folder.addInput(effect, "maxDelay", { min: 2, max: 4, step: 0.01 });
	folder.addInput(effect, "minDuration", { min: 0, max: 0.6, step: 0.01 });
	folder.addInput(effect, "maxDuration", { min: 0.6, max: 1.8, step: 0.01 });
	folder.addInput(effect, "minStrength", { min: 0, max: 1, step: 0.01 });
	folder.addInput(effect, "maxStrength", { min: 0, max: 1, step: 0.01 });
	folder.addInput(effect, "ratio", { min: 0, max: 1, step: 0.01 });
	folder.addInput(effect, "columns", { min: 0, max: 0.5, step: 0.01 });
	folder.addInput(params, "custom pattern")
		.on("change", (e) => effect.perturbationMap = (e.value ? assets.get("noise") : noiseTexture));

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

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		pipeline.render(timestamp);
		requestAnimationFrame(render);

	});

}));
