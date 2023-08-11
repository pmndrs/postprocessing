import {
	Color,
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	IcosahedronGeometry,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	GodRaysEffect,
	KernelSize,
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
	controls.position.set(-1, -0.3, -30);
	controls.lookAt(0, 0, -35);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	const sun = new Mesh(
		new IcosahedronGeometry(1, 3),
		new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		})
	);

	sun.position.set(0, 0.06, -1).multiplyScalar(1000);
	sun.scale.setScalar(40);
	sun.updateMatrix();
	sun.frustumCulled = false;

	// Post Processing

	const effect = new GodRaysEffect({
		lightSource: sun,
		kernelSize: KernelSize.SMALL,
		density: 0.96,
		decay: 0.92,
		weight: 0.3,
		exposure: 0.54,
		samples: 32,
		resolutionScale: 0.5
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));

	// Settings

	const fpsMeter = new FPSMeter();
	const color = new Color();
	const godRaysMaterial = effect.godRaysMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = {
		"color": color.copy(sun.material.color).convertLinearToSRGB().getHex()
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });
	folder.addInput(effect, "blur");
	folder.addInput(effect.blurPass, "kernelSize", { label: "blurriness", options: KernelSize });
	folder.addInput(godRaysMaterial, "density", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "decay", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "weight", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "exposure", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "maxIntensity", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "samples", { min: 16, max: 128, step: 1 });
	folder.addInput(params, "color", { view: "color" })
		.on("change", (e) => sun.material.color.setHex(e.value).convertSRGBToLinear());
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
