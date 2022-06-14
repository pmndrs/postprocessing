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
	BlendFunction,
	EdgeDetectionMode,
	EffectComposer,
	EffectPass,
	PredicationMode,
	RenderPass,
	SMAAEffect,
	SMAAPreset,
	TextureEffect
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


	const effect = new SMAAEffect({
		blendFunction: BlendFunction.NORMAL,
		preset: SMAAPreset.MEDIUM,
		edgeDetectionMode: EdgeDetectionMode.COLOR,
		predicationMode: PredicationMode.DEPTH
	});

	const edgeDetectionMaterial = effect.edgeDetectionMaterial;
	edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
	edgeDetectionMaterial.predicationThreshold = 0.002;
	edgeDetectionMaterial.predicationScale = 1;

	const effectPass = new EffectPass(camera, effect);

	// BEGIN DEBUG
	const smaaEdgesDebugPass = new EffectPass(camera, effect,
		new TextureEffect({ texture: effect.edgesTexture }));
	const smaaWeightsDebugPass = new EffectPass(camera, effect,
		new TextureEffect({ texture: effect.weightsTexture }));

	effectPass.renderToScreen = true;
	smaaEdgesDebugPass.renderToScreen = true;
	smaaWeightsDebugPass.renderToScreen = true;
	smaaEdgesDebugPass.enabled = false;
	smaaWeightsDebugPass.enabled = false;
	smaaEdgesDebugPass.fullscreenMaterial.encodeOutput = false;
	smaaWeightsDebugPass.fullscreenMaterial.encodeOutput = false;
	// END DEBUG

	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);
	composer.addPass(smaaEdgesDebugPass);
	composer.addPass(smaaWeightsDebugPass);

	// Settings

	delete PredicationMode.CUSTOM; // disable for this demo

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const SMAADebug = { OFF: 0, EDGES: 1, WEIGHTS: 2 };
	const params = {
		"preset": SMAAPreset.MEDIUM,
		"debug": SMAADebug.OFF
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(params, "debug", { options: SMAADebug }).on("change", (e) => {

		effectPass.enabled = (e.value === SMAADebug.OFF);
		smaaEdgesDebugPass.enabled = (e.value === SMAADebug.EDGES);
		smaaWeightsDebugPass.enabled = (e.value === SMAADebug.WEIGHTS);

	});

	folder.addInput(params, "preset", { options: SMAAPreset }).on("change", (e) => {

		const threshold = edgeDetectionMaterial.edgeDetectionThreshold;
		effect.applyPreset(e.value);
		edgeDetectionMaterial.edgeDetectionThreshold = threshold;

	});

	let subfolder = folder.addFolder({ title: "Edge Detection", expanded: false });
	subfolder.addInput(edgeDetectionMaterial, "edgeDetectionMode", { options: EdgeDetectionMode });
	subfolder.addInput(edgeDetectionMaterial, "edgeDetectionThreshold", { min: 0.01, max: 0.3, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationMode", { options: PredicationMode });
	subfolder.addInput(edgeDetectionMaterial, "predicationThreshold", { min: 4e-4, max: 0.01, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationStrength", { min: 0, max: 1, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationScale", { min: 1, max: 2, step: 0.01 });

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
