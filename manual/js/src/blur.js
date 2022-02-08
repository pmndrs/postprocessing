import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	EffectComposer,
	KawaseBlurPass,
	KernelSize,
	RenderPass
} from "../../../src";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "./utils";
import * as CornellBox from "./objects/CornellBox";

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
		loadingManager.onError = (url) => reject(`Failed to load ${url}`);

		cubeTextureLoader.load(urls, (t) => {

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

	});

}

function initialize(assets) {

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
	scene.add(...CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES)),
		frameBufferType: HalfFloatType
	});

	const kawaseBlurPass = new KawaseBlurPass({ height: 480 });
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(kawaseBlurPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });
	pane.addSeparator();

	const params = {
		"resolution": kawaseBlurPass.getResolution().getHeight(),
		"kernel size": kawaseBlurPass.getKernelSize(),
		"scale": kawaseBlurPass.getScale()
	};

	function reducer(a, b) {

		a[b] = b;
		return a;

	}

	pane.addInput(params, "resolution", { options: [360, 480, 720, 1080].reduce(reducer, {}) })
		.on("change", (e) => kawaseBlurPass.getResolution().setPreferredHeight(e.value));
	pane.addInput(params, "kernel size", { options: KernelSize })
		.on("change", (e) => kawaseBlurPass.setKernelSize(e.value));
	pane.addInput(params, "scale", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => kawaseBlurPass.setScale(e.value));

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

}

window.addEventListener("load", () => load().then(initialize).catch((e) => {

	const container = document.querySelector(".viewport");
	const message = document.createElement("p");
	message.classList.add("error");
	message.innerText = e.toString();
	container.append(message);
	console.error(e);

}));
