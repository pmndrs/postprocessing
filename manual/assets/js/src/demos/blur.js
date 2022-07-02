import {
	ColorManagement,
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	EffectComposer,
	GaussianBlurPass,
	KawaseBlurPass,
	KernelSize,
	RenderPass
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
import * as CornellBox from "../objects/CornellBox";

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

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => load().then((assets) => {

	ColorManagement.legacyMode = false;

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = sRGBEncoding;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport");
	container.prepend(renderer.domElement);

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

	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, renderer.capabilities.maxSamples)
	});

	const gaussianBlurPass = new GaussianBlurPass({ resolutionScale: 0.75, kernelSize: 35 });
	const kawaseBlurPass = new KawaseBlurPass({ resolutionScale: 0.75, kernelSize: KernelSize.MEDIUM });

	gaussianBlurPass.renderToScreen = true;
	kawaseBlurPass.renderToScreen = true;
	kawaseBlurPass.enabled = false;

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(gaussianBlurPass);
	composer.addPass(kawaseBlurPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	const tab = folder.addTab({
		pages: [
			{ title: "Gaussian" },
			{ title: "Kawase" }
		]
	});

	tab.on("select", (event) => {

		gaussianBlurPass.enabled = (event.index === 0);
		kawaseBlurPass.enabled = (event.index === 1);

	});

	tab.pages[0].addInput(gaussianBlurPass.blurMaterial, "kernelSize", {
		options: {
			"7x7": 7,
			"15x15": 15,
			"25x25": 25,
			"35x35": 35,
			"63x63": 63,
			"127x127": 127,
			"255x255": 255
		}
	});

	tab.pages[0].addInput(gaussianBlurPass.blurMaterial, "scale", { min: 0, max: 2, step: 0.01 });
	tab.pages[0].addInput(gaussianBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });
	tab.pages[0].addInput(gaussianBlurPass, "iterations", { min: 1, max: 8, step: 1 });

	tab.pages[1].addInput(kawaseBlurPass.blurMaterial, "kernelSize", { options: KernelSize });
	tab.pages[1].addInput(kawaseBlurPass.blurMaterial, "scale", { min: 0, max: 2, step: 0.01 });
	tab.pages[1].addInput(kawaseBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });

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
