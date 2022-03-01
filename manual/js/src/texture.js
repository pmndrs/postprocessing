import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	RepeatWrapping,
	Scene,
	sRGBEncoding,
	TextureLoader,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectComposer,
	EffectPass,
	RenderPass,
	TextureEffect
} from "../../../src";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "./utils";
import * as CornellBox from "./objects/CornellBox";

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
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

		textureLoader.load(document.baseURI + "img/textures/lens-dirt/scratches.jpg", (t) => {

			t.encoding = sRGBEncoding;
			t.wrapS = t.wrapT = RepeatWrapping;
			assets.set("scratches", t);

		});

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

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);
	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0x000000, 0);
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

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

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES)),
		frameBufferType: HalfFloatType
	});

	const textureEffect = new TextureEffect({
		blendFunction: BlendFunction.COLOR_DODGE,
		texture: assets.get("scratches")
	});

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new EffectPass(camera, textureEffect));

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });
	pane.addSeparator();

	const texture = textureEffect.getTexture();
	const params = {
		"opacity": textureEffect.getBlendMode().getOpacity(),
		"blend mode": textureEffect.getBlendMode().getBlendFunction()
	};

	const folder = pane.addFolder({ title: "UV Transform", expanded: false });
	folder.addInput(texture, "rotation", { min: 0, max: 2 * Math.PI, step: 0.001 });

	let subFolder = folder.addFolder({ title: "offset" });
	subFolder.addInput(texture.offset, "x", { min: 0, max: 1, step: 0.001 });
	subFolder.addInput(texture.offset, "y", { min: 0, max: 1, step: 0.001 });

	subFolder = folder.addFolder({ title: "repeat" });
	subFolder.addInput(texture.repeat, "x", { min: 0, max: 2, step: 0.001 });
	subFolder.addInput(texture.repeat, "y", { min: 0, max: 2, step: 0.001 });

	subFolder = folder.addFolder({ title: "center" });
	subFolder.addInput(texture.center, "x", { min: 0, max: 1, step: 0.001 });
	subFolder.addInput(texture.center, "y", { min: 0, max: 1, step: 0.001 });

	pane.addInput(params, "opacity", { min: 0, max: 1, step: 0.01 })
		.on("change", (e) => textureEffect.getBlendMode().setOpacity(e.value));
	pane.addInput(params, "blend mode", { options: BlendFunction })
		.on("change", (e) => textureEffect.getBlendMode().setBlendFunction(e.value));

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
