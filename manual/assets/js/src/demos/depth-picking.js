import {
	CubeTextureLoader,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	SRGBColorSpace,
	Vector3,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	CopyPass,
	DepthPickingPass,
	EffectComposer,
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
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky");
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	const cursor = new Mesh(
		new SphereGeometry(0.2, 32, 32),
		new MeshBasicMaterial({
			color: 0xa9a9a9,
			transparent: true,
			depthWrite: false,
			opacity: 0.5
		})
	);

	scene.add(cursor);

	// Post Processing

	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, renderer.capabilities.maxSamples)
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

}));
