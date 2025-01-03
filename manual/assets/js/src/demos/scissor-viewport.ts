import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	Texture,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as DefaultEnvironment from "../objects/DefaultEnvironment.js";
import * as CornellBox from "../objects/CornellBox.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky-space", t);

		});

		cubeTextureLoader.load(Utils.getSkyboxUrls("sunset"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky-sunset", t);

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

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.debug.checkShaderErrors = Utils.isLocalhost;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.getElementById("viewport")!;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera(50, 1, 1, 1000);
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 1.7, 5);
	controls.lookAt(0, 1, 0);

	// Scene, Lights, Objects

	const sceneA = new Scene();
	sceneA.background = assets.get("sky-space")!;
	sceneA.environment = sceneA.background;
	sceneA.fog = DefaultEnvironment.createFog();
	sceneA.add(DefaultEnvironment.createLights());
	sceneA.add(DefaultEnvironment.createEnvironment());

	const sceneB = new Scene();
	sceneB.background = assets.get("sky-sunset")!;
	sceneB.add(CornellBox.createLights());
	sceneB.add(CornellBox.createEnvironment());
	sceneB.add(CornellBox.createActors());
	sceneB.position.y = 1;

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	const clearPassA = new ClearPass();
	const clearPassB = new ClearPass();
	const geometryPassA = new GeometryPass(sceneA, camera, { samples: 4 });
	const geometryPassB = new GeometryPass(sceneB, camera);
	const effectPass = new EffectPass(new ToneMappingEffect());

	geometryPassB.output.defaultBuffer = geometryPassA.output.defaultBuffer;

	geometryPassA.scissor.enabled = true;
	geometryPassB.scissor.enabled = true;
	geometryPassA.viewport.enabled = true;
	geometryPassB.viewport.enabled = true;

	clearPassA.scissor.enabled = true;
	clearPassB.scissor.enabled = true;
	clearPassA.viewport.enabled = true;
	clearPassB.viewport.enabled = true;

	pipeline.add(clearPassA, geometryPassA, clearPassB, geometryPassB, effectPass);

	// Settings

	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth;
		const height = container.clientHeight;
		const widthHalf = Math.round(width / 2);

		camera.aspect = widthHalf / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

		geometryPassA.scissor.set(0, 0, widthHalf, height);
		geometryPassB.scissor.set(widthHalf, 0, widthHalf, height);
		geometryPassA.viewport.set(0, 0, widthHalf, height);
		geometryPassB.viewport.set(widthHalf, 0, widthHalf, height);

		clearPassA.scissor.set(0, 0, widthHalf, height);
		clearPassB.scissor.set(widthHalf, 0, widthHalf, height);
		clearPassA.viewport.set(0, 0, widthHalf, height);
		clearPassB.viewport.set(widthHalf, 0, widthHalf, height);

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
