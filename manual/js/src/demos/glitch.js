import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	RGBAFormat,
	Scene,
	sRGBEncoding,
	TextureLoader,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ChromaticAberrationEffect,
	EffectComposer,
	EffectPass,
	GlitchEffect,
	GlitchMode,
	NoiseTexture,
	RenderPass
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
import * as CornellBox from "../objects/CornellBox";

function load() {

	const assets = new Map();
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

	return new Promise((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		textureLoader.load(document.baseURI + "img/textures/perturb.jpg", (t) => {

			assets.set("noise", t);

		});

		cubeTextureLoader.load(urls, (t) => {

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);
	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0x000000, 0);
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.setMode(ControlMode.THIRD_PERSON);
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.zoom.setDamping(0.1);
	settings.translation.setEnabled(false);
	controls.setPosition(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky");
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES)),
		frameBufferType: HalfFloatType
	});

	const chromaticAberrationEffect = new ChromaticAberrationEffect();
	const glitchEffect = new GlitchEffect({
		perturbationMap: assets.get("noise"),
		chromaticAberrationOffset: chromaticAberrationEffect.getOffset() // optional
	});

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new EffectPass(camera, glitchEffect));
	composer.addPass(new EffectPass(camera, chromaticAberrationEffect));

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });
	pane.addSeparator();

	const noiseTexture = new NoiseTexture(64, 64, RGBAFormat);

	const params = {
		"glitch mode": glitchEffect.getMode(),
		"custom pattern": true,
		"min delay": glitchEffect.getMinDelay(),
		"max delay": glitchEffect.getMaxDelay(),
		"min duration": glitchEffect.getMinDuration(),
		"max duration": glitchEffect.getMaxDuration(),
		"min strength": glitchEffect.getMinStrength(),
		"max strength": glitchEffect.getMaxStrength(),
		"glitch ratio": glitchEffect.getGlitchRatio(),
		"glitch columns": glitchEffect.getGlitchColumns(),
		"opacity": glitchEffect.getBlendMode().getOpacity(),
		"blend mode": glitchEffect.getBlendMode().getBlendFunction()
	};

	pane.addInput(params, "glitch mode", { options: GlitchMode }).on("change", (e) => glitchEffect.setMode(e.value));
	pane.addInput(params, "custom pattern")
		.on("change", (e) => glitchEffect.setPerturbationMap(e.value ? assets.get("noise") : noiseTexture));

	pane.addInput(params, "min delay", { min: 0, max: 2, step: 0.01 })
		.on("change", (e) => glitchEffect.setMinDelay(e.value));
	pane.addInput(params, "max delay", { min: 2, max: 4, step: 0.01 })
		.on("change", (e) => glitchEffect.setMaxDelay(e.value));
	pane.addInput(params, "min duration", { min: 0, max: 0.6, step: 0.01 })
		.on("change", (e) => glitchEffect.setMinDuration(e.value));
	pane.addInput(params, "max duration", { min: 0.6, max: 1.8, step: 0.01 })
		.on("change", (e) => glitchEffect.setMaxDuration(e.value));
	pane.addInput(params, "min strength", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => glitchEffect.setMinStrength(e.value));
	pane.addInput(params, "max strength", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => glitchEffect.setMaxStrength(e.value));
	pane.addInput(params, "glitch ratio", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => glitchEffect.setGlitchRatio(e.value));
	pane.addInput(params, "glitch columns", { min: 0, max: 0.5, step: 0.01 })
		.on("change", (e) => glitchEffect.setGlitchColumns(e.value));

	// Resize Handler

	function onResize() {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		composer.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp) {

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		composer.render();
		requestAnimationFrame(render);

	});

}));
