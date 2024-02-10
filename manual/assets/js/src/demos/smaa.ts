import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as CornellBox from "../objects/CornellBox.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("sunset"), (t) => {

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
	scene.background = assets.get("sky") as Texture;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	pipeline.autoRenderToScreen = false;
	pipeline.add(new ClearPass());
	pipeline.add(new GeometryPass(scene, camera, {
		frameBufferType: HalfFloatType
	}));

	/*
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

	const effectPass = new EffectPass(effect, new ToneMappingEffect());

	// #region DEBUG
	const smaaEdgesDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.edgesTexture }));
	const smaaWeightsDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.weightsTexture }));

	effect.blendMode.blendFunction = new MixBlendFunction();
	effectPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.output.defaultBuffer = null;
	smaaWeightsDebugPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.enabled = false;
	smaaWeightsDebugPass.enabled = false;
	smaaEdgesDebugPass.fullscreenMaterial.encodeOutput = false;
	smaaWeightsDebugPass.fullscreenMaterial.encodeOutput = false;
	// #endregion DEBUG

	pipeline.addPass(effectPass);
	pipeline.addPass(smaaEdgesDebugPass);
	pipeline.addPass(smaaWeightsDebugPass);
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const smaaDebug = {
		OFF: 0,
		EDGES: 1,
		WEIGHTS: 2
	};

	const params = {
		"preset": SMAAPreset.MEDIUM,
		"debug": smaaDebug.OFF
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(params, "debug", { options: smaaDebug }).on("change", (e) => {

		effectPass.enabled = (e.value === smaaDebug.OFF);
		smaaEdgesDebugPass.enabled = (e.value === smaaDebug.EDGES);
		smaaWeightsDebugPass.enabled = (e.value === smaaDebug.WEIGHTS);

	});

	folder.addBinding(params, "preset", { options: Utils.enumToRecord(SMAAPreset) }).on("change", (e) => {

		const threshold = edgeDetectionMaterial.edgeDetectionThreshold;
		effect.applyPreset(e.value);
		edgeDetectionMaterial.edgeDetectionThreshold = threshold;

	});

	const subfolder = folder.addFolder({ title: "Edge Detection", expanded: false });
	subfolder.addBinding(edgeDetectionMaterial, "edgeDetectionMode", { options: Utils.enumToRecord(EdgeDetectionMode) });
	subfolder.addBinding(edgeDetectionMaterial, "edgeDetectionThreshold", { min: 0.01, max: 0.3, step: 1e-4 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationMode", { options: Utils.enumToRecord(PredicationMode) });
	subfolder.addBinding(edgeDetectionMaterial, "predicationThreshold", { min: 4e-4, max: 0.01, step: 1e-4 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationStrength", { min: 0, max: 1, step: 1e-4 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationScale", { min: 1, max: 2, step: 0.01 });

	Utils.addBlendModeBindings(folder, effect.blendMode);
	*/

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

		requestAnimationFrame(render);

	});

}));
