import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	HalftoneEffect,
	HalftoneShape,
	RenderPipeline,
	ToneMappingEffect
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

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-01", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		gltfLoader.load(
			`${document.baseURI}models/enchanted-crystal/enchanted-crystal.glb`,
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
	controls.position.set(0, 1, -1);
	controls.lookAt(0, 1, 1);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	const gltf = assets.get("model") as GLTF;
	Utils.setAnisotropy(gltf.scene, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
	gltf.scene.translateY(1);
	gltf.scene.scale.setScalar(2);
	scene.add(gltf.scene);

	// Post Processing

	const effect = new HalftoneEffect({
		shape: HalftoneShape.LINE,
		radius: 7.073,
		rotation: Math.PI / 4
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(effect, new ToneMappingEffect())
	);

	// Settings

	const params = { rotation: effect.rotationR };

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "shape", { options: Utils.enumToRecord(HalftoneShape) });
	folder.addBinding(effect, "radius", { min: 1, max: 25, step: 1e-3 });
	folder.addBinding(effect, "samples", { min: 1, max: 24, step: 1 });
	folder.addBinding(effect, "scatterFactor", { min: 0, max: 1, step: 1e-3 });

	const subfolder = folder.addFolder({ title: "Rotation", expanded: false });
	const bindingR = subfolder.addBinding(effect, "rotationR", { min: 0, max: Math.PI, step: 1e-4 });
	const bindingG = subfolder.addBinding(effect, "rotationG", { min: 0, max: Math.PI, step: 1e-4 });
	const bindingB = subfolder.addBinding(effect, "rotationB", { min: 0, max: Math.PI, step: 1e-4 });

	folder.addBinding(params, "rotation", { min: 0, max: Math.PI, step: 1e-4 }).on("change", (e) => {

		effect.rotation = e.value;

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

	function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		gltf.scene.position.y = 1 + Math.sin(pipeline.timer.getElapsed()) * 0.01;
		pipeline.render(timestamp);
		fpsGraph.end();

	}

	pipeline.compile().then(() => {

		// Only render when the canvas is visible.
		const viewportObserver = new IntersectionObserver(
			(entries) => renderer.setAnimationLoop(entries[0].isIntersecting ? render : null)
		);

		container.prepend(renderer.domElement);
		viewportObserver.observe(container);

	}).catch((e) => console.error(e));

}));
