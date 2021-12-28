import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	EdgeDetectionMode,
	EffectComposer,
	EffectPass,
	PredicationMode,
	RenderPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "./utils";
import * as CornellBox from "./objects/CornellBox";

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);
	const smaaImageLoader = new SMAAImageLoader(loadingManager);

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

		smaaImageLoader.load(([search, area]) => {

			assets.set("smaa-search", search);
			assets.set("smaa-area", area);

		});

	});


}

function initialize(assets) {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false,
		alpha: false
	});

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);
	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0xFFFFFF, 1);
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;
	renderer.physicallyCorrectLights = true;
	renderer.info.autoReset = false;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.setMode(ControlMode.THIRD_PERSON);
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.zoom.setDamping(0.1);
	settings.translation.setSensitivity(3.0);
	settings.translation.setDamping(0.1);
	controls.setPosition(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky");
	scene.add(...CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType
	});

	const smaaEffect = new SMAAEffect(
		assets.get("smaa-search"),
		assets.get("smaa-area"),
		SMAAPreset.HIGH,
		EdgeDetectionMode.COLOR
	);

	const edgeDetectionMaterial = smaaEffect.edgeDetectionMaterial;
	edgeDetectionMaterial.setEdgeDetectionThreshold(0.02);
	edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
	edgeDetectionMaterial.setPredicationThreshold(0.002);
	edgeDetectionMaterial.setPredicationScale(1.0);

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new EffectPass(camera, smaaEffect));

	// Resize Handler

	function onResize() {

		const w = container.clientWidth, h = container.clientHeight;
		camera.aspect = Math.max(w / h, 16 / 9);
		camera.fov = calculateVerticalFoV(90, camera.aspect);
		camera.updateProjectionMatrix();
		composer.setSize(w, h);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp) {

		renderer.info.reset();
		controls.update(timestamp);
		composer.render();
		requestAnimationFrame(render);

	});

}

window.addEventListener("load", () => load().then(initialize));
