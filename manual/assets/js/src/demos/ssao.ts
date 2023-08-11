import {
	Color,
	CubeTexture,
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	SSAOEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import * as CornellBox from "../objects/CornellBox.js";

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
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport") as HTMLElement;
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
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const effect = new SSAOEffect({
		worldDistanceThreshold: 20,
		worldDistanceFalloff: 5,
		worldProximityThreshold: 0.4,
		worldProximityFalloff: 0.1,
		luminanceInfluence: 0.7,
		samples: 16,
		radius: 0.04,
		intensity: 1,
		resolutionScale: 0.5
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));

	// Settings

	const fpsMeter = new FPSMeter();
	const color = new Color();
	const ssaoMaterial = effect.ssaoMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = { "color": 0x000000 };
	const folder = pane.addFolder({ title: "Settings" });

	let subfolder = folder.addFolder({ title: "Distance Cutoff", expanded: false });
	subfolder.addInput(ssaoMaterial, "worldDistanceThreshold", { min: 0, max: 100, step: 0.1 });
	subfolder.addInput(ssaoMaterial, "worldDistanceFalloff", { min: 0, max: 10, step: 0.1 });
	subfolder = folder.addFolder({ title: "Proximity Cutoff", expanded: false });
	subfolder.addInput(ssaoMaterial, "worldProximityThreshold", { min: 0, max: 3, step: 1e-2 });
	subfolder.addInput(ssaoMaterial, "worldProximityFalloff", { min: 0, max: 3, step: 1e-2 });

	if(renderer.capabilities.isWebGL2) {

		folder.addInput(effect, "depthAwareUpsampling");

	}

	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.25, max: 1, step: 0.05 });

	folder.addInput(ssaoMaterial, "samples", { min: 1, max: 32, step: 1 });
	folder.addInput(ssaoMaterial, "rings", { min: 1, max: 16, step: 1 });
	folder.addInput(ssaoMaterial, "radius", { min: 1e-6, max: 1.0, step: 1e-2 });
	folder.addInput(ssaoMaterial, "minRadiusScale", { min: 0, max: 1, step: 1e-2 });
	folder.addInput(ssaoMaterial, "bias", { min: 0, max: 0.5, step: 1e-3 });
	folder.addInput(ssaoMaterial, "fade", { min: 0, max: 1, step: 1e-3 });
	folder.addInput(effect, "intensity", { min: 0, max: 4, step: 1e-2 });
	folder.addInput(effect, "luminanceInfluence", { min: 0, max: 1, step: 1e-2 });
	folder.addInput(params, "color", { view: "color" })
		.on("change", (e) => effect.color = (e.value === 0) ? null : color.setHex(e.value).convertSRGBToLinear());

	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

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
