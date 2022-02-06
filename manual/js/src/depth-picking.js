import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereBufferGeometry,
	sRGBEncoding,
	Vector3,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	CopyPass,
	DepthPickingPass,
	EffectComposer,
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

	const path = "/img/textures/skies/sunset/";
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

	const cursor = new Mesh(
		new SphereBufferGeometry(0.2, 32, 32),
		new MeshBasicMaterial({
			color: 0x666666,
			transparent: true,
			depthWrite: false,
			opacity: 0.5
		})
	);

	scene.add(cursor);

	// Post Processing

	// const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		// multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES)),
		frameBufferType: HalfFloatType
	});

	const depthPickingPass = new DepthPickingPass();
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(depthPickingPass);
	composer.addPass(new CopyPass());

	const ndc = new Vector3();

	async function pickDepth(event) {

		const clientRect = container.getBoundingClientRect();
		const clientX = event.clientX - clientRect.left;
		const clientY = event.clientY - clientRect.top;
		ndc.x = (clientX / container.clientWidth) * 2.0 - 1.0;
		ndc.y = -(clientY / container.clientHeight) * 2.0 + 1.0;

		ndc.z = await depthPickingPass.readDepth(ndc);
		ndc.z = ndc.z * 2.0 - 1.0;

		// Convert from NDC to world position.
		cursor.position.copy(ndc.unproject(camera));

	}

	container.addEventListener("pointermove", (e) => void pickDepth(e), { passive: true });

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

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
