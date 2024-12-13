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
	EffectPass,
	GeometryPass,
	MixBlendFunction,
	RenderPipeline,
	SMAAEdgeDetectionMode,
	SMAAPredicationMode,
	SMAAEffect,
	SMAAPreset,
	TextureEffect,
	ToneMappingEffect
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

	const container = document.getElementById("viewport")!;
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
	scene.background = assets.get("sky")!;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const effect = new SMAAEffect({
		preset: SMAAPreset.MEDIUM,
		edgeDetectionMode: SMAAEdgeDetectionMode.COLOR,
		predicationMode: SMAAPredicationMode.DEPTH
	});

	const effectPass = new EffectPass(effect, new ToneMappingEffect());

	const pipeline = new RenderPipeline(renderer);
	pipeline.autoRenderToScreen = false;

	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, {
			frameBufferType: HalfFloatType
		}),
		effectPass
	);

	// #region DEBUG
	const smaaEdgesDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.edgesTexture.value }));
	const smaaWeightsDebugPass = new EffectPass(effect, new TextureEffect({ texture: effect.weightsTexture.value }));

	effect.blendMode.blendFunction = new MixBlendFunction();
	effectPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.output.defaultBuffer = null;
	smaaWeightsDebugPass.output.defaultBuffer = null;
	smaaEdgesDebugPass.enabled = false;
	smaaWeightsDebugPass.enabled = false;
	smaaEdgesDebugPass.fullscreenMaterial.colorSpaceConversion = false;
	smaaWeightsDebugPass.fullscreenMaterial.colorSpaceConversion = false;

	pipeline.add(smaaEdgesDebugPass, smaaWeightsDebugPass);
	// #endregion DEBUG

	// Settings

	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);
	const edgeDetectionMaterial = effect.edgeDetectionMaterial;

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

	const edgeDetectionOptions = Utils.enumToRecord(SMAAEdgeDetectionMode);
	const predicationOptions = Utils.enumToRecord(SMAAPredicationMode);

	const subfolder = folder.addFolder({ title: "Edge Detection", expanded: false });
	subfolder.addBinding(edgeDetectionMaterial, "edgeDetectionMode", { options: edgeDetectionOptions });
	subfolder.addBinding(edgeDetectionMaterial, "edgeDetectionThreshold", { min: 1e-5, max: 0.1, step: 1e-5 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationMode", { options: predicationOptions });
	subfolder.addBinding(edgeDetectionMaterial, "predicationThreshold", { min: 1e-4, max: 0.01, step: 1e-4 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationStrength", { min: 0, max: 1, step: 1e-4 });
	subfolder.addBinding(edgeDetectionMaterial, "predicationScale", { min: 1, max: 5, step: 0.01 });

	Utils.addBlendModeBindings(folder, effect.blendMode);

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth;
		const height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	renderer.setAnimationLoop((timestamp: number) => {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

	});

}));
