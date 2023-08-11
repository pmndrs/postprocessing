import {
	ClampToEdgeWrapping,
	LinearFilter,
	LoadingManager,
	PerspectiveCamera,
	PlaneGeometry,
	Mesh,
	MeshBasicMaterial,
	Scene,
	TextureLoader,
	WebGLRenderer,
	Texture,
	SRGBColorSpace
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	LookupTexture,
	LUT3DEffect,
	LUT3dlLoader,
	LUTCubeLoader,
	RawImageData,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import { toRecord } from "../utils/ArrayUtils.js";

const luts = new Map<string, string | null>([
	["neutral-2", null],
	["neutral-4", null],
	["neutral-8", null],
	["png/bleach-bypass", "png/bleach-bypass.png"],
	["png/candle-light", "png/candle-light.png"],
	["png/cool-contrast", "png/cool-contrast.png"],
	["png/warm-contrast", "png/warm-contrast.png"],
	["png/desaturated-fog", "png/desaturated-fog.png"],
	["png/evening", "png/evening.png"],
	["png/fall", "png/fall.png"],
	["png/filmic1", "png/filmic1.png"],
	["png/filmic2", "png/filmic2.png"],
	["png/matrix-green", "png/matrix-green.png"],
	["png/strong-amber", "png/strong-amber.png"],
	["3dl/cinematic", "3dl/presetpro-cinematic.3dl"],
	["cube/cinematic", "cube/presetpro-cinematic.cube"],
	["cube/django-25", "cube/django-25.cube"]
]);

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
	const lut3dlLoader = new LUT3dlLoader(loadingManager);
	const lutCubeLoader = new LUTCubeLoader(loadingManager);

	const lutNeutral2 = LookupTexture.createNeutral(2);
	lutNeutral2.name = "neutral-2";
	assets.set(lutNeutral2.name, lutNeutral2);

	const lutNeutral4 = LookupTexture.createNeutral(4);
	lutNeutral4.name = "neutral-4";
	assets.set(lutNeutral4.name, lutNeutral4);

	const lutNeutral8 = LookupTexture.createNeutral(8);
	lutNeutral8.name = "neutral-8";
	assets.set(lutNeutral8.name, lutNeutral8);

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		textureLoader.load(document.baseURI + "img/textures/photos/GEDC0053.jpg", (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("photo", t);

		});

		for(const entry of luts) {

			if(entry[1] === null) {

				continue;

			} else if(/.3dl$/im.test(entry[1])) {

				lut3dlLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					assets.set(entry[0], t);

				}).catch((e) => console.error(e));

			} else if(/.cube$/im.test(entry[1])) {

				lutCubeLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					assets.set(entry[0], t);

				}).catch((e) => console.error(e));

			} else {

				textureLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					t.generateMipmaps = false;
					t.minFilter = LinearFilter;
					t.magFilter = LinearFilter;
					t.wrapS = ClampToEdgeWrapping;
					t.wrapT = ClampToEdgeWrapping;
					t.flipY = false;
					assets.set(entry[0], t);

				});

			}

		}

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
	renderer.setClearAlpha(0);

	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.zoom.sensitivity = 0.05;
	settings.zoom.damping = 0.1;
	settings.rotation.sensitivity = 0;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 1.4);

	// Scene & Objects

	const scene = new Scene();
	const mesh = new Mesh(
		new PlaneGeometry(),
		new MeshBasicMaterial({
			map: assets.get("photo") as Texture
		})
	);

	mesh.scale.x = 2;
	scene.add(mesh);

	// LUT Preview

	const img = document.createElement("img");
	img.title = "This is a compressed preview image";
	img.classList.add("lut", "hidden");
	container.append(img);

	// Post Processing

	const lut = LookupTexture.from(assets.get("png/filmic1") as Texture);
	const effect = renderer.capabilities.isWebGL2 ? new LUT3DEffect(lut) :
		new LUT3DEffect(lut.convertToUint8().toDataTexture());

	effect.blendMode.blendFunction = BlendFunction.NORMAL;

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera));
	pipeline.addPass(new EffectPass(effect));

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = {
		"lut": effect.lut.name,
		"3D texture": true,
		"base size": effect.lut.image.width,
		"scale up": false,
		"target size": 48
	};

	let objectURL = null;

	function updateLUTPreview() {

		const lut = LookupTexture.from(effect.lut);
		const { image } = lut.convertToUint8().toDataTexture();
		RawImageData.from(image).toCanvas().toBlob((blob) => {

			if(blob !== null) {

				objectURL = URL.createObjectURL(blob);
				img.src = objectURL;
				img.classList.remove("hidden");

			}

		});

	}

	updateLUTPreview();

	function changeLUT(): void {

		const original = assets.get(params.lut) as Texture;
		const size = Math.min(original.image.width, original.image.height);
		const scaleUp = params["scale up"] && (params["target size"] > size);

		let promise;

		if(scaleUp) {

			const lut = (original instanceof LookupTexture) ? original : LookupTexture.from(original);
			console.time("Tetrahedral Upscaling");
			promise = lut.scaleUp(params["target size"], false);
			document.body.classList.add("progress");

		} else {

			promise = Promise.resolve(LookupTexture.from(original));

		}

		promise.then((lut) => {

			if(scaleUp) {

				console.timeEnd("Tetrahedral Upscaling");
				document.body.classList.remove("progress");

			}

			effect.lut.dispose();
			params["base size"] = size;

			if(renderer.capabilities.isWebGL2) {

				if(renderer.getContext().getExtension("OES_texture_float_linear") === null) {

					console.log("Linear float filtering not supported, converting to Uint8");
					lut.convertToUint8();

				}

				effect.lut = (params["3D texture"] ? lut : lut.toDataTexture());

			} else {

				effect.lut = lut.convertToUint8().toDataTexture();

			}

			updateLUTPreview();

		}).catch((error) => console.error(error));

	}

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(params, "lut", { options: toRecord([...luts.keys()]) }).on("change", changeLUT);

	if(renderer.capabilities.isWebGL2) {

		folder.addInput(params, "3D texture").on("change", changeLUT);
		folder.addInput(effect, "tetrahedralInterpolation");

	}

	folder.addMonitor(params, "base size", { format: (v) => v.toFixed(0) });
	folder.addInput(params, "scale up").on("change", changeLUT);
	folder.addInput(params, "target size", { options: toRecord([32, 48, 64, 128]) }).on("change", changeLUT);
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
