import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	PointLight,
	SRGBColorSpace,
	Scene,
	Texture,
	WebGLRenderer
} from "three";

import {
	ColorDepthEffect,
	ClearPass,
	EffectPass,
	GeometryPass,
	MixBlendFunction,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture | GLTF>> {

	const assets = new Map<string, Texture | GLTF>();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture | GLTF>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-03", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		gltfLoader.load(
			`${document.baseURI}models/spaceship-corridor/spaceship-corridor.glb`,
			(gltf) => assets.set("model", gltf)
		);

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

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1, 8.25);
	controls.lookAt(0, 0.6, -1);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;

	const light0 = new PointLight(0xbeefff, 20, 12, 2);
	light0.position.set(0, 0.3, -5);
	scene.add(light0);

	const light1 = new PointLight(0xffedde, 6, 0, 2);
	light1.position.set(0, 1.3, 5);
	scene.add(light1);

	const gltf = assets.get("model") as GLTF;
	Utils.setAnisotropy(gltf.scene, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
	scene.add(gltf.scene);

	// Post Processing

	const effect = new ColorDepthEffect({ r: 4, g: 4, b: 4 });
	effect.blendMode.blendFunction = new MixBlendFunction();

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(new ToneMappingEffect(), effect)
	);

	// Settings

	const params = { bitDepth: effect.r };

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	const subfolder = folder.addFolder({ title: "Channels", expanded: false });
	const bindingR = subfolder.addBinding(effect, "r", { min: 0, max: 16, step: 1 });
	const bindingG = subfolder.addBinding(effect, "g", { min: 0, max: 16, step: 1 });
	const bindingB = subfolder.addBinding(effect, "b", { min: 0, max: 16, step: 1 });

	folder.addBinding(params, "bitDepth", { min: 0, max: 16, step: 1 }).on("change", (e) => {

		effect.r = e.value;
		effect.g = e.value;
		effect.b = e.value;

		bindingR.refresh();
		bindingG.refresh();
		bindingB.refresh();

	});

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

	pipeline.compile().then(() => {

		container.prepend(renderer.domElement);

		renderer.setAnimationLoop((timestamp) => {

			fpsGraph.begin();
			controls.update(timestamp);
			pipeline.render(timestamp);
			fpsGraph.end();

		});

	}).catch((e) => console.error(e));

}));
