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
	BloomEffect,
	ClearPass,
   DitheringEffect,
   DitheringType,
	EffectPass,
	GeometryPass,
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

		cubeTextureLoader.load(Utils.getSkyboxUrls("space", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		gltfLoader.load(
			`${document.baseURI}models/emissive-strength-test/EmissiveStrengthTest.gltf`,
			(gltf) => assets.set("emissive-strength-test", gltf)
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
	settings.rotation.damping = 0.025;
	settings.translation.damping = 0.1;
	controls.position.set(0, 3, 18);
	controls.lookAt(0, 3, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	// scene.background = skyMap;
	// scene.environment = skyMap;
	// scene.fog = DefaultEnvironment.createFog();
	// scene.add(DefaultEnvironment.createEnvironment());

	const gltf = assets.get("emissive-strength-test") as GLTF;
	gltf.scene.position.y = 3;
	scene.add(gltf.scene);

	// Post Processing

	const bloomEffect = new BloomEffect({
		luminanceThreshold: 1.0,
		luminanceSmoothing: 0.0,
		intensity: 9.31,
		radius: 0.540,
		levels: 8
	});

   bloomEffect.luminancePass.enabled = false

   const ditheringEffect = new DitheringEffect({
      intensity: 1.0,
      ditheringType: DitheringType.LUMABASED
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(bloomEffect, ditheringEffect, new ToneMappingEffect())
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);


   const ditheringTypeOptions = Utils.enumToRecord(DitheringType);

   const ditheringFolder = pane.addFolder({ title: "Dithering Settings" });
	ditheringFolder.addBinding(ditheringEffect, "intensity", { min: 0, max: 10, step: 0.01 });
   ditheringFolder.addBinding(ditheringEffect, "ditheringType", { options: ditheringTypeOptions });

	const bloomFolder = pane.addFolder({ title: "Bloom Settings" });
	bloomFolder.addBinding(bloomEffect, "intensity", { min: 0, max: 10, step: 0.01 });
	bloomFolder.addBinding(bloomEffect.mipmapBlurPass, "radius", { min: 0, max: 1, step: 1e-3 });
	bloomFolder.addBinding(bloomEffect.mipmapBlurPass, "levels", { min: 1, max: 10, step: 1 });
	bloomFolder.addBinding(bloomEffect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });

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
