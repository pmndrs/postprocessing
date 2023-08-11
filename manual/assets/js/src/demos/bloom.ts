import {
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	Group,
	IcosahedronGeometry,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Raycaster,
	SRGBColorSpace,
	Scene,
	Vector2,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	BloomEffect,
	EffectPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import * as Domain from "../objects/Domain.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path = document.baseURI + "img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(urls, (t) => {

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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	const orbs = new Group();

	const n = 12;
	const step = 2.0 * Math.PI / n;
	const radius = 4.0;
	let angle = 0.0;

	for(let i = 0; i < n; ++i) {

		const orb = new Mesh(
			new IcosahedronGeometry(1, 3),
			new MeshBasicMaterial({
				color: Math.random() * 0xffffff
			})
		);

		// Arrange the objects in a circle.
		orb.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
		orb.scale.setScalar(0.15);
		orbs.add(orb);
		angle += step;

	}

	scene.add(orbs);

	// Post Processing

	const effect = new BloomEffect({
		luminanceThreshold: 0.1,
		luminanceSmoothing: 0.3,
		intensity: 1.0
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));

	// Object Picking

	const ndc = new Vector2();
	const raycaster = new Raycaster();
	renderer.domElement.addEventListener("pointerdown", (event) => {

		const clientRect = container.getBoundingClientRect();
		const clientX = event.clientX - clientRect.left;
		const clientY = event.clientY - clientRect.top;
		ndc.x = (clientX / container.clientWidth) * 2.0 - 1.0;
		ndc.y = -(clientY / container.clientHeight) * 2.0 + 1.0;
		raycaster.setFromCamera(ndc, camera);
		const intersects = raycaster.intersectObjects(orbs.children, true);

		if(intersects.length > 0) {

			effect.selection.toggle(intersects[0].object);

		}

	});

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(effect, "intensity", { min: 0, max: 10, step: 0.01 });
	folder.addInput(effect.mipmapBlurPass, "radius", { min: 0, max: 1, step: 1e-3 });
	folder.addInput(effect.mipmapBlurPass, "levels", { min: 1, max: 9, step: 1 });

	let subfolder = folder.addFolder({ title: "Luminance Filter" });
	subfolder.addInput(effect.luminancePass, "enabled");
	subfolder.addInput(effect.luminanceMaterial, "threshold", { min: 0, max: 1, step: 0.01 });
	subfolder.addInput(effect.luminanceMaterial, "smoothing", { min: 0, max: 1, step: 0.01 });

	subfolder = folder.addFolder({ title: "Selection" });
	subfolder.addInput(effect, "inverted");
	subfolder.addInput(effect, "ignoreBackground");

	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		pipeline.render(timestamp);
		requestAnimationFrame(render);

	});

}));
