import {
	AmbientLight,
	Color,
	ColorManagement,
	DirectionalLight,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	BoxBlurPass,
	DepthDownsamplingPass,
	EffectComposer,
	EffectPass,
	NormalPass,
	RenderPass,
	SSAOEffect
} from "postprocessing";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
import * as Domain from "../objects/Domain";

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
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

		gltfLoader.load(`${document.baseURI}models/machine/machine.gltf`, (gltf) => {

			assets.set("machine", gltf);

		});

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
	renderer.setClearColor(0x000000);
	renderer.setClearAlpha(0);

	const container = document.querySelector(".viewport");
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new OrthographicCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.setMode(ControlMode.THIRD_PERSON);
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.zoom.setEnabled(false);
	settings.translation.setEnabled(false);
	controls.setPosition(2, 1, 10);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky");

	const machine = assets.get("machine");
	scene.add(machine.scene);

	machine.scene.traverse((object) => {

		if(object.isMesh && object.material) {

			object.material.envMap = assets.get("sky");

		}

	});

	const ambientLight = new AmbientLight(0xffffff);
	const mainLight = new DirectionalLight(0xffffff, 1.0);
	mainLight.position.set(0, 1, -1).multiplyScalar(10);
	mainLight.castShadow = true;
	mainLight.shadow.bias = -0.01;
	mainLight.shadow.camera.near = 0.3;
	mainLight.shadow.camera.far = 20;
	mainLight.shadow.mapSize.width = 512;
	mainLight.shadow.mapSize.height = 512;
	mainLight.shadow.radius = 1;
	scene.add(mainLight);

	// Post Processing

	const composer = new EffectComposer(renderer, {
		//multisampling: Math.min(4, renderer.capabilities.maxSamples)
	});

	const normalPass = new NormalPass(scene, camera);
	const depthDownsamplingPass = new DepthDownsamplingPass({
		normalBuffer: normalPass.texture,
		resolutionScale: 0.5
	});

	const normalDepthBuffer = renderer.capabilities.isWebGL2 ? depthDownsamplingPass.texture : null;

	const effect = new SSAOEffect(camera, normalPass.texture, {
		blendFunction: BlendFunction.NORMAL,
		distanceScaling: true,
		depthAwareUpsampling: false,
		normalDepthBuffer,
		worldDistanceThreshold: 20,
		worldDistanceFalloff: 5,
		worldProximityThreshold: 0.4,
		worldProximityFalloff: 0.1,
		radius: 0.1,
		intensity: 3.33,
		resolutionScale: 0.5
	});

	const effectPass = new EffectPass(camera, effect);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(normalPass);

	if(renderer.capabilities.isWebGL2) {

		composer.addPass(depthDownsamplingPass);

	}

	composer.addPass(effectPass);

	const blurPass = new BoxBlurPass({
		iterations: 2,
		bilateral: true,
		resolutionScale: 0.5
	});

	blurPass.blurMaterial.adoptCameraSettings(camera);
	composer.addPass(blurPass);

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

	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.25, max: 1, step: 0.05 })
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
		camera.left = width / -2;
		camera.right = width / 2;
		camera.top = height / 2;
		camera.bottom = height / -2;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.zoom = 100;
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
