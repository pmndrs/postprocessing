import * as DefaultEnvironment from "../objects/DefaultEnvironment.js";
import * as Utils from "../utils/index.js";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	LensDistortionEffect,
	MixBlendFunction,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";
import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	WebGLRenderer
} from "three";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) =>
			reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

	});

}

window.addEventListener(
	"load",
	() =>
		void load().then((assets) => {

			// Renderer

			const renderer = new WebGLRenderer({
				powerPreference: "high-performance",
				antialias: false,
				stencil: false,
				depth: false
			});

			renderer.debug.checkShaderErrors = Utils.isLocalhost;
			const container = document.querySelector(".viewport") as HTMLElement;
			container.prepend(renderer.domElement);

			// Camera & Controls

			const camera = new PerspectiveCamera();
			const controls = new SpatialControls(
				camera.position,
				camera.quaternion,
				renderer.domElement
			);
			const settings = controls.settings;
			settings.rotation.sensitivity = 2.2;
			settings.rotation.damping = 0.05;
			settings.translation.damping = 0.1;
			controls.position.set(0, 1.5, 10);
			controls.lookAt(0, 1.35, 0);

			// Scene, Lights, Objects

			const scene = new Scene();
			const skyMap = assets.get("sky") as Texture;
			scene.background = skyMap;
			scene.environment = skyMap;
			scene.fog = DefaultEnvironment.createFog();
			scene.add(DefaultEnvironment.createEnvironment());

			// Post Processing

			const effect = new LensDistortionEffect();
			effect.blendMode.blendFunction = new MixBlendFunction();

			const pipeline = new RenderPipeline(renderer);
			pipeline.add(
				new ClearPass(),
				new GeometryPass(scene, camera, {
					frameBufferType: HalfFloatType,
					samples: 4
				}),
				new EffectPass(effect, new ToneMappingEffect())
			);

			// Settings

			const pane = new Pane({
				container: container.querySelector(".tp") as HTMLElement
			});
			const fpsGraph = Utils.createFPSGraph(pane);

			const folder = pane.addFolder({ title: "Settings" });
			folder.addBinding(effect, "skew", { min: 0, max: 10, step: 1 });
			folder.addBinding(effect, "distortion", {
				x: { min: -1, max: 1, step: 0.1 },
				y: { min: -1, max: 1, step: 0.1 }
			});
			folder.addBinding(effect, "principalPoint", {
				x: { min: -1, max: 1, step: 0.1 },
				y: { min: -1, max: 1, step: 0.1 }
			});
			folder.addBinding(effect, "focalLength", {
				x: { min: 0, max: 2, step: 0.1 },
				y: { min: 0, max: 2, step: 0.1 }
			});

			Utils.addBlendModeBindings(folder, effect.blendMode);

			// Resize Handler

			function onResize(): void {

				const width = container.clientWidth,
					height = container.clientHeight;
				camera.aspect = width / height;
				camera.fov = Utils.calculateVerticalFoV(
					90,
					Math.max(camera.aspect, 16 / 9)
				);
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

		})
);
