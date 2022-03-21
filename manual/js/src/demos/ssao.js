import {
	Color,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	DepthDownsamplingPass,
	EffectComposer,
	EffectPass,
	NormalPass,
	RenderPass,
	SSAOEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0x000000, 0);
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.translation.setDamping(0.1);
	controls.setPosition(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x0a0809, 0.06);
	scene.background = assets.get("sky");
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES))
	});

	const normalPass = new NormalPass(scene, camera);
	const depthDownsamplingPass = new DepthDownsamplingPass({
		normalBuffer: normalPass.texture,
		resolutionScale: 0.5
	});

	const normalDepthBuffer = renderer.capabilities.isWebGL2 ? depthDownsamplingPass.texture : null;

	const effect = new SSAOEffect(camera, normalPass.texture, {
		distanceScaling: true,
		depthAwareUpsampling: false,
		normalDepthBuffer,
		worldDistanceThreshold: 20,
		worldDistanceFalloff: 5,
		worldProximityThreshold: 0.4,
		worldProximityFalloff: 0.1,
		radius: 0.1,
		intensity: 1.33,
		resolutionScale: 0.5
	});

	const effectPass = new EffectPass(camera, effect);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(normalPass);

	if(renderer.capabilities.isWebGL2) {

		composer.addPass(depthDownsamplingPass);

	}

	composer.addPass(effectPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const color = new Color();
	const ssaoMaterial = effect.ssaoMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = { "color": 0x000000 };
	const folder = pane.addFolder({ title: "Settings" });

	let subfolder = folder.addFolder({ title: "Distance Cutoff", expanded: false });
	subfolder.addInput(ssaoMaterial, "worldDistanceThreshold", { min: 0, max: 100, step: 0.1 });
	subfolder.addInput(ssaoMaterial, "worldDistanceFalloff", { min: 0, max: 10, step: 0.1 });
	subfolder = folder.addFolder({ title: "Proximity Cutoff", expanded: false });
	subfolder.addInput(ssaoMaterial, "worldProximityThreshold", { min: 0, max: 3, step: 1e-2 });
	subfolder.addInput(ssaoMaterial, "worldProximityFalloff", { min: 0, max: 3, step: 1e-2 });

	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.25, max: 1, step: 0.25 })
		.on("change", (e) => depthDownsamplingPass.resolution.scale = e.value);

	if(renderer.capabilities.isWebGL2) {

		folder.addInput(effect, "depthAwareUpsampling");

	}

	folder.addInput(ssaoMaterial, "samples", { min: 1, max: 32, step: 1 });
	folder.addInput(ssaoMaterial, "rings", { min: 1, max: 16, step: 1 });
	folder.addInput(ssaoMaterial, "radius", { min: 1e-6, max: 1.0, step: 1e-2 });
	folder.addInput(ssaoMaterial, "distanceScaling");
	folder.addInput(ssaoMaterial, "minRadiusScale", { min: 0, max: 1, step: 1e-2 });
	folder.addInput(ssaoMaterial, "bias", { min: 0, max: 0.5, step: 1e-3 });
	folder.addInput(ssaoMaterial, "fade", { min: 0, max: 1, step: 1e-3 });
	folder.addInput(ssaoMaterial, "intensity", { min: 0, max: 4, step: 1e-2 });
	folder.addInput(effect, "luminanceInfluence", { min: 0, max: 1, step: 1e-2 });
	folder.addInput(params, "color", { view: "color" }).on("change", (e) => {

		if(e.value === 0x000000) {

			effect.color = null;

		} else {

			effect.color = color.setHex(e.value).convertSRGBToLinear();

		}

	});

	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

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
