import {
	CubeTextureLoader,
	LoadingManager,
	Mesh,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer,
	Texture,
	Material,
	HalfFloatType
} from "three";

import {
	ClearPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import * as DefaultEnvironment from "../objects/DefaultEnvironment.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture | GLTF>> {

	const assets = new Map<string, Texture | GLTF>();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture | GLTF>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		gltfLoader.load(`${document.baseURI}models/rocks/rock-14/rock-14.gltf`,
			(gltf) => assets.set("rock-14", gltf));

		gltfLoader.load(`${document.baseURI}models/potted-plant-01/potted-plant-01.gltf`,
			(gltf) => assets.set("potted-plant-01", gltf));

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

	renderer.setClearColor(0x000000, 0);
	renderer.debug.checkShaderErrors = Utils.isLocalhost;
	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.025;
	settings.translation.damping = 0.1;
	controls.position.set(0.3, 0.9, 1);
	controls.lookAt(0, 0.5, -5);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	const gltfRock14 = assets.get("rock-14") as GLTF;
	const rock14 = gltfRock14.scene;
	rock14.position.set(0, 0, -5);
	scene.add(rock14);

	const gltfPottedPlant01 = assets.get("potted-plant-01") as GLTF;
	const pottedPlant01 = gltfPottedPlant01.scene;
	scene.add(pottedPlant01);

	const leaves = pottedPlant01.getObjectByName("potted-plant-01-leaves") as Mesh;
	const leavesMaterial = leaves.material as Material;
	leavesMaterial.alphaToCoverage = true;

	scene.traverse((object) => {

		if(object instanceof Mesh) {

			object.castShadow = object.receiveShadow = true;

		}

	});

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	pipeline.autoRenderToScreen = false;
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, {
			frameBufferType: HalfFloatType,
			samples: 4
		})
	);

	/*
	const effect = new DepthOfFieldEffect({
		kernelSize: KernelSize.SMALL,
		worldFocusDistance: 0,
		worldFocusRange: 8,
		bokehScale: 7.0,
		resolutionScale: 0.5
	});

	const effectPass = new EffectPass(effect);

	// #region DEBUG
	const cocDebugPass = new EffectPass(new TextureEffect({ texture: effect.cocTexture }));
	effectPass.output.defaultBuffer = null;
	cocDebugPass.output.defaultBuffer = null;
	cocDebugPass.enabled = false;
	cocDebugPass.fullscreenMaterial.encodeOutput = false;
	// #endregion DEBUG

	effect.blendMode.blendFunction = new MixBlendFunction();
	pipeline.addPass(new EffectPass(effect, new ToneMappingEffect()));
	pipeline.addPass(cocDebugPass);
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const cocMaterial = effect.cocMaterial;
	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(cocDebugPass, "enabled", { label: "debug" });
	folder.addBinding(effect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });

	folder.addBinding(effect.blurPass, "kernelSize", { options: KernelSize });
	folder.addBinding(cocMaterial, "worldFocusDistance", { min: 0, max: 50, step: 0.1 });
	folder.addBinding(cocMaterial, "worldFocusRange", { min: 0, max: 20, step: 0.1 });
	folder.addBinding(effect, "bokehScale", { min: 0, max: 7, step: 1e-2 });

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
