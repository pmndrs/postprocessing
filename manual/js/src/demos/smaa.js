import {
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
	SMAAImageLoader,
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
	const smaaImageLoader = new SMAAImageLoader(loadingManager);

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

		smaaImageLoader.load(([search, area]) => {

			assets.set("smaa-search", search);
			assets.set("smaa-area", area);

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

	const composer = new EffectComposer(renderer);

	const smaaEffect = new SMAAEffect(
		assets.get("smaa-search"),
		assets.get("smaa-area"),
		SMAAPreset.MEDIUM,
		EdgeDetectionMode.COLOR
	);

	const edgeDetectionMaterial = smaaEffect.getEdgeDetectionMaterial();
	edgeDetectionMaterial.setEdgeDetectionThreshold(0.02);
	edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
	edgeDetectionMaterial.setPredicationThreshold(0.002);
	edgeDetectionMaterial.setPredicationScale(1);

	const smaaPass = new EffectPass(camera, smaaEffect);

	// BEGIN DEBUG
	const smaaEdgesDebugPass = new EffectPass(camera, smaaEffect,
		new TextureEffect({ texture: smaaEffect.getEdgesTexture() }));
	const smaaWeightsDebugPass = new EffectPass(camera, smaaEffect,
		new TextureEffect({ texture: smaaEffect.getWeightsTexture() }));

	smaaPass.renderToScreen = true;
	smaaEdgesDebugPass.renderToScreen = true;
	smaaWeightsDebugPass.renderToScreen = true;
	smaaEdgesDebugPass.setEnabled(false);
	smaaWeightsDebugPass.setEnabled(false);
	smaaEdgesDebugPass.getFullscreenMaterial().setOutputEncodingEnabled(false);
	smaaWeightsDebugPass.getFullscreenMaterial().setOutputEncodingEnabled(false);
	// END DEBUG

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(smaaPass);
	composer.addPass(smaaEdgesDebugPass);
	composer.addPass(smaaWeightsDebugPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const SMAADebug = { OFF: 0, EDGES: 1, WEIGHTS: 2 };
	delete PredicationMode.CUSTOM; // disable for this demo

	const params = {
		"preset": SMAAPreset.MEDIUM,
		"debug": SMAADebug.OFF,
		"opacity": smaaEffect.getBlendMode().getOpacity(),
		"blend mode": smaaEffect.getBlendMode().getBlendFunction(),
		edgeDetection: {
			"mode": Number(edgeDetectionMaterial.defines.EDGE_DETECTION_MODE),
			"threshold": Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD)
		},
		predication: {
			"mode": Number(edgeDetectionMaterial.defines.PREDICATION_MODE),
			"threshold": Number(edgeDetectionMaterial.defines.PREDICATION_THRESHOLD),
			"strength": Number(edgeDetectionMaterial.defines.PREDICATION_STRENGTH),
			"scale": Number(edgeDetectionMaterial.defines.PREDICATION_SCALE)
		}
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(params, "preset", { options: SMAAPreset }).on("change", (e) => {

		smaaEffect.applyPreset(e.value);
		edgeDetectionMaterial.setEdgeDetectionThreshold(params.edgeDetection.threshold);

	});

	let subfolder = folder.addFolder({ title: "Edge Detection", expanded: false });
	subfolder.addInput(params.edgeDetection, "mode", { options: EdgeDetectionMode })
		.on("change", (e) => edgeDetectionMaterial.setEdgeDetectionMode(e.value));
	subfolder.addInput(params.edgeDetection, "threshold", { min: 0.01, max: 0.3, step: 0.0001 })
		.on("change", (e) => edgeDetectionMaterial.setEdgeDetectionThreshold(e.value));
	subfolder = subfolder.addFolder({ title: "Predicated Thresholding" });
	subfolder.addInput(params.predication, "mode", { options: PredicationMode })
		.on("change", (e) => edgeDetectionMaterial.setPredicationMode(e.value));
	subfolder.addInput(params.predication, "threshold", { min: 0.0004, max: 0.01, step: 0.0001 })
		.on("change", (e) => edgeDetectionMaterial.setPredicationThreshold(e.value));
	subfolder.addInput(params.predication, "strength", { min: 0, max: 1, step: 0.0001 })
		.on("change", (e) => edgeDetectionMaterial.setPredicationStrength(e.value));
	subfolder.addInput(params.predication, "scale", { min: 1, max: 2, step: 0.01 })
		.on("change", (e) => edgeDetectionMaterial.setPredicationScale(e.value));

	folder.addInput(params, "debug", { options: SMAADebug }).on("change", (e) => {

		smaaPass.setEnabled(e.value === SMAADebug.OFF);
		smaaEdgesDebugPass.setEnabled(e.value === SMAADebug.EDGES);
		smaaWeightsDebugPass.setEnabled(e.value === SMAADebug.WEIGHTS);

	});

	folder.addInput(params, "opacity", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => smaaEffect.getBlendMode().setOpacity(e.value));
	folder.addInput(params, "blend mode", { options: BlendFunction })
		.on("change", (e) => smaaEffect.getBlendMode().setBlendFunction(e.value));

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
