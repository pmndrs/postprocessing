import {
	CubeTextureLoader,
	FogExp2,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectComposer,
	EffectPass,
	RenderPass,
	ToneMappingEffect,
	ToneMappingMode
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter, toRecord } from "../utils";
import * as Domain from "../objects/Domain";

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
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

		cubeTextureLoader.load(urls, (t) => {

			t.colorSpace = SRGBColorSpace;
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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport");
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
	scene.background = assets.get("sky");
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, renderer.capabilities.maxSamples),
		frameBufferType: HalfFloatType
	});

	const effect = new ToneMappingEffect({
		blendFunction: BlendFunction.NORMAL,
		mode: ToneMappingMode.REINHARD2_ADAPTIVE,
		resolution: 256,
		whitePoint: 4.0,
		middleGrey: 0.6,
		minLuminance: 0.01,
		averageLuminance: 0.01,
		adaptationRate: 1.0
	});

	const effectPass = new EffectPass(camera, effect);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const adaptiveLuminanceMaterial = effect.adaptiveLuminanceMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addBinding(fpsMeter, "fps", { readonly: true, label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(renderer, "toneMappingExposure", { min: 0, max: 2, step: 1e-3 });
	folder.addBinding(effect, "mode", { options: ToneMappingMode });

	const tab = folder.addTab({
		pages: [
			{ title: "Reinhard2" },
			{ title: "Uncharted2" }
		]
	});

	tab.pages[0].addBinding(effect, "whitePoint", { min: 1, max: 20, step: 1e-2 });
	tab.pages[0].addBinding(effect, "middleGrey", { min: 0, max: 1, step: 1e-4 });
	tab.pages[0].addBinding(effect, "averageLuminance", { min: 1e-4, max: 1, step: 1e-3 });
	const subfolder = tab.pages[0].addFolder({ title: "Adaptive" });
	subfolder.addBinding(effect, "resolution", {
		options: [64, 128, 256, 512].reduce(toRecord, {}),
		label: "resolution"
	});

	subfolder.addBinding(adaptiveLuminanceMaterial, "minLuminance", { min: 0, max: 3, step: 1e-3 });
	subfolder.addBinding(adaptiveLuminanceMaterial, "adaptationRate", { min: 0, max: 3, step: 1e-3 });

	tab.pages[1].addBinding(effect, "whitePoint", { min: 1, max: 20, step: 1e-2 });

	folder.addBinding(effectPass, "dithering");
	folder.addBinding(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect.blendMode, "blendFunction", { options: BlendFunction });

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
