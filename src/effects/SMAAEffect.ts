import {
	Color,
	LinearFilter,
	LoadingManager,
	NearestFilter,
	OrthographicCamera,
	PerspectiveCamera,
	Texture,
	Uniform,
	WebGLRenderTarget
} from "three";

import { GBuffer } from "../enums/GBuffer.js";
import { SMAAEdgeDetectionMode } from "../enums/SMAAEdgeDetectionMode.js";
import { SMAAPredicationMode } from "../enums/SMAAPredicationMode.js";
import { SMAAPreset } from "../enums/SMAAPreset.js";
import { SMAAEdgeDetectionMaterial } from "../materials/SMAAEdgeDetectionMaterial.js";
import { SMAAWeightsMaterial } from "../materials/SMAAWeightsMaterial.js";
import { ClearPass } from "../passes/ClearPass.js";
import { ShaderPass } from "../passes/ShaderPass.js";
import { Resolution } from "../utils/Resolution.js";
import { Effect } from "./Effect.js";

import searchImageDataURL from "../textures/smaa/searchImageDataURL.js";
import areaImageDataURL from "../textures/smaa/areaImageDataURL.js";

import fragmentShader from "./shaders/smaa.frag";

/**
 * SMAAEffect options.
 *
 * @category Effects
 */

export interface SMAAEffectOptions {

	/**
	 * The quality preset.
	 *
	 * @defaultValue {@link SMAAPreset.MEDIUM}
	 */

	preset?: SMAAPreset;

	/**
	 * The edge detection mode.
	 *
	 * @defaultValue {@link SMAAEdgeDetectionMode.COLOR}
	 */

	edgeDetectionMode?: SMAAEdgeDetectionMode;

	/**
	 * The predication mode.
	 *
	 * @defaultValue {@link SMAAPredicationMode.DEPTH}
	 */

	predicationMode?: SMAAPredicationMode;

}

/**
 * Subpixel Morphological Antialiasing (SMAA).
 *
 * @see https://github.com/iryoku/smaa/releases/tag/v2.8
 * @category Effects
 */

export class SMAAEffect extends Effect {

	/**
	 * Identifies the SMAA edges buffer.
	 */

	private static readonly BUFFER_EDGES = "BUFFER_EDGES";

	/**
	 * Identifies the SMAA weights buffer.
	 */

	private static readonly BUFFER_WEIGHTS = "BUFFER_WEIGHTS";

	/**
	* A clear pass for the edges buffer.
	*/

	private clearPass: ClearPass;

	/**
	* An edge detection pass.
	*/

	private edgeDetectionPass: ShaderPass<SMAAEdgeDetectionMaterial>;

	/**
	* An SMAA weights pass.
	*/

	private weightsPass: ShaderPass<SMAAWeightsMaterial>;

	/**
	 * Constructs a new SMAA effect.
	 *
	 * @param options - The options.
	 */

	constructor({
		preset = SMAAPreset.MEDIUM,
		edgeDetectionMode = SMAAEdgeDetectionMode.COLOR,
		predicationMode = SMAAPredicationMode.DEPTH
	}: SMAAEffectOptions = {}) {

		super("SMAAEffect");

		this.fragmentShader = fragmentShader;
		this.output.setBuffer(SMAAEffect.BUFFER_EDGES, this.createFramebuffer());
		this.output.setBuffer(SMAAEffect.BUFFER_WEIGHTS, this.createFramebuffer());
		this.input.uniforms.set("weightMap", new Uniform(this.weightsTexture));
		this.input.gBuffer.add(GBuffer.DEPTH);

		this.clearPass = new ClearPass(true, false, false);
		this.clearPass.output.defaultBuffer = this.renderTargetEdges;
		this.clearPass.clearValues.color = new Color(0x000000);
		this.clearPass.clearValues.alpha = 1;

		this.edgeDetectionPass = new ShaderPass(new SMAAEdgeDetectionMaterial());
		this.edgeDetectionPass.output.defaultBuffer = this.renderTargetEdges;
		this.edgeDetectionMaterial.edgeDetectionMode = edgeDetectionMode;
		this.edgeDetectionMaterial.predicationMode = predicationMode;

		this.weightsPass = new ShaderPass(new SMAAWeightsMaterial());
		this.weightsPass.input.defaultBuffer = this.edgesTexture;
		this.weightsPass.output.defaultBuffer = this.renderTargetWeights;

		this.subpasses = [this.clearPass, this.edgeDetectionPass, this.weightsPass];

		this.loadTextures();
		this.applyPreset(preset);

	}

	override get camera(): OrthographicCamera | PerspectiveCamera | null {

		return super.camera;

	}

	override set camera(value: OrthographicCamera | PerspectiveCamera | null) {

		super.camera = value;

		if(value !== null) {

			this.edgeDetectionMaterial.copyCameraSettings(value);

		}

	}

	/**
	 * A render target for the SMAA edge detection.
	 */

	private get renderTargetEdges(): WebGLRenderTarget {

		return this.output.getBuffer(SMAAEffect.BUFFER_EDGES)!;

	}

	/**
	 * A render target for the SMAA edge weights.
	 */

	private get renderTargetWeights(): WebGLRenderTarget {

		return this.output.getBuffer(SMAAEffect.BUFFER_WEIGHTS)!;

	}

	/**
	 * The edges texture.
	 */

	get edgesTexture(): Texture {

		return this.renderTargetEdges.texture;

	}

	/**
	 * The edge weights texture.
	 */

	get weightsTexture(): Texture {

		return this.renderTargetWeights.texture;

	}

	/**
	 * The edge detection material.
	 */

	get edgeDetectionMaterial(): SMAAEdgeDetectionMaterial {

		return this.edgeDetectionPass.fullscreenMaterial;

	}

	/**
	 * The edge weights material.
	 */

	get weightsMaterial(): SMAAWeightsMaterial {

		return this.weightsPass.fullscreenMaterial;

	}

	/**
	 * Loads the SMAA lookup textures.
	 */

	private loadTextures(): void {

		const loadingManager = new LoadingManager();
		let searchImage: HTMLImageElement;
		let areaImage: HTMLImageElement;

		loadingManager.onLoad = () => {

			const searchTexture = new Texture(searchImage);
			searchTexture.name = "SMAA.Search";
			searchTexture.magFilter = NearestFilter;
			searchTexture.minFilter = NearestFilter;
			searchTexture.generateMipmaps = false;
			searchTexture.needsUpdate = true;
			searchTexture.flipY = true;

			const areaTexture = new Texture(areaImage);
			areaTexture.name = "SMAA.Area";
			areaTexture.magFilter = LinearFilter;
			areaTexture.minFilter = LinearFilter;
			areaTexture.generateMipmaps = false;
			areaTexture.needsUpdate = true;
			areaTexture.flipY = false;

			this.disposables.add(searchTexture);
			this.disposables.add(areaTexture);

			this.weightsMaterial.searchTexture = searchTexture;
			this.weightsMaterial.areaTexture = areaTexture;

		};

		loadingManager.itemStart("search");
		loadingManager.itemStart("area");

		if(typeof Image !== "undefined") {

			searchImage = new Image();
			areaImage = new Image();
			searchImage.addEventListener("load", () => loadingManager.itemEnd("search"));
			areaImage.addEventListener("load", () => loadingManager.itemEnd("area"));
			searchImage.src = searchImageDataURL;
			areaImage.src = areaImageDataURL;

		}

	}

	/**
	 * Applies the given quality preset.
	 *
	 * @param preset - The preset.
	 */

	applyPreset(preset: SMAAPreset): void {

		const edgeDetectionMaterial = this.edgeDetectionMaterial;
		const weightsMaterial = this.weightsMaterial;

		switch(preset) {

			case SMAAPreset.LOW:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.05;
				weightsMaterial.orthogonalSearchSteps = 4;
				weightsMaterial.diagonalDetection = false;
				weightsMaterial.cornerDetection = false;
				break;

			case SMAAPreset.MEDIUM:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
				weightsMaterial.orthogonalSearchSteps = 8;
				weightsMaterial.diagonalDetection = false;
				weightsMaterial.cornerDetection = false;
				break;

			case SMAAPreset.HIGH:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.02;
				weightsMaterial.orthogonalSearchSteps = 16;
				weightsMaterial.diagonalSearchSteps = 8;
				weightsMaterial.cornerRounding = 25;
				weightsMaterial.diagonalDetection = true;
				weightsMaterial.cornerDetection = true;
				break;

			case SMAAPreset.ULTRA:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.01;
				weightsMaterial.orthogonalSearchSteps = 32;
				weightsMaterial.diagonalSearchSteps = 16;
				weightsMaterial.cornerRounding = 25;
				weightsMaterial.diagonalDetection = true;
				weightsMaterial.cornerDetection = true;
				break;

		}

	}

	protected override onInputChange(): void {

		this.edgeDetectionMaterial.inputBuffer = this.input.defaultBuffer?.value ?? null;
		this.edgeDetectionMaterial.depthBuffer = this.input.getBuffer(GBuffer.DEPTH);

	}

	protected override onResolutionChange(resolution: Resolution): void {

		const { width, height } = resolution;

		this.edgeDetectionMaterial.setSize(width, height);
		this.weightsMaterial.setSize(width, height);
		this.renderTargetEdges.setSize(width, height);
		this.renderTargetWeights.setSize(width, height);

	}

	override render(): void {

		this.clearPass.render();
		this.edgeDetectionPass.render();
		this.weightsPass.render();

	}

}
