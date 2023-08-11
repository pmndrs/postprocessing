import {
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
	EdgeDetectionMode,
	EffectPass,
	GeometryPass,
	PredicationMode,
	RenderPipeline,
	SMAAEffect,
	SMAAPreset,
	TextureEffect
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

	const effectPass = new EffectPass(effect);

	// #region DEBUG
	const smaaEdgesDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.edgesTexture }));
	const smaaWeightsDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.weightsTexture }));

	effectPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.output.defaultBuffer = null;
	smaaWeightsDebugPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.enabled = false;
	smaaWeightsDebugPass.enabled = false;
	smaaEdgesDebugPass.fullscreenMaterial.encodeOutput = false;
	smaaWeightsDebugPass.fullscreenMaterial.encodeOutput = false;
	// #endregion DEBUG

	const pipeline = new RenderPipeline(renderer);
	pipeline.autoRenderToScreen = false;
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));
	pipeline.addPass(effectPass);
	pipeline.addPass(smaaEdgesDebugPass);
	pipeline.addPass(smaaWeightsDebugPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
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

	const subfolder = folder.addFolder({ title: "Edge Detection", expanded: false });
	subfolder.addInput(edgeDetectionMaterial, "edgeDetectionMode", { options: EdgeDetectionMode });
	subfolder.addInput(edgeDetectionMaterial, "edgeDetectionThreshold", { min: 0.01, max: 0.3, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationMode", { options: PredicationMode });
	subfolder.addInput(edgeDetectionMaterial, "predicationThreshold", { min: 4e-4, max: 0.01, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationStrength", { min: 0, max: 1, step: 1e-4 });
	subfolder.addInput(edgeDetectionMaterial, "predicationScale", { min: 1, max: 2, step: 0.01 });

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
