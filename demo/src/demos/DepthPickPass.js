import {
	RGBADepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget,
	Vector3,
	Raycaster
} from "three";

import { Pass } from "../../../src/passes/Pass";
import { DepthCopyMaterial } from "./DepthCopyMaterial";

const UnpackDownscale = 255 / 256;

const PackFactorsX = 256 * 256 * 256, PackFactorsY = 256 * 256, PackFactorsZ = 256;
const
	UnpackFactorsX = UnpackDownscale / PackFactorsX,
	UnpackFactorsY = UnpackDownscale / PackFactorsY,
	UnpackFactorsZ = UnpackDownscale / PackFactorsZ;

function unpackRGBAToDepth(v) {

	return (v[0] * UnpackFactorsX + v[1] * UnpackFactorsY + v[2] * UnpackFactorsZ + v[3]) / 256;

}

export class DepthPickPass extends Pass {

	constructor(camera, depthPacking = RGBADepthPacking) {

		super("DepthPickPass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;
		this.sceneCamera = camera;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			// use RGBADepthPacking by default to get higher resolution on mobile devices.
			type: depthPacking === RGBADepthPacking ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthPickPass.Target";

		// this.near = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] - 1.0);
		// this.far = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] + 1.0);
		// console.log("nearfar", this.near, this.far);

		this.x = 0;
		this.y = 0;

		window.depthPickPass = this;

	}


	get texture() {

		return this.renderTarget.texture;

	}

	get depthPacking() {

		return this.getFullscreenMaterial().outputDepthPacking;

	}

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.getFullscreenMaterial();
		material.uniforms.depthBuffer.value = depthTexture;
		material.inputDepthPacking = depthPacking;

	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

		const pixelBuffer = new Uint8Array(4);
		renderer.readRenderTargetPixels(this.renderTarget, this.x, this.renderTarget.height - this.y, 1, 1, pixelBuffer);

		// https://stackoverflow.com/a/56439173
		// console.log("GPU depth", -perspectiveDepthToViewZ(unpackRGBAToDepth(pixelBuffer) / 255, this.sceneCamera.near, this.sceneCamera.far));

		// console.log("GPU depth", unpackRGBAToDepth(pixelBuffer) / 255);
		const gpuZ = -perspectiveDepthToViewZ(unpackRGBAToDepth(pixelBuffer), this.sceneCamera.near, this.sceneCamera.far);

		const z = unpackRGBAToDepth(pixelBuffer);
		// vec4: ndc x, y, z represented with w taking z
		const world = new Vector3(mouse.x, mouse.y, z * 2 - 1).unproject(this.sceneCamera);
		// const world = new Vector3(worldW.x / worldW.w, worldW.y / worldW.w, worldW.z / worldW.w);

		this.gpuRaycastLocation = world;

		const gpu = world.clone().sub(this.sceneCamera.position).length();

		if(lastCPURaycastLocation) {

			const cpu = lastCPURaycastLocation.clone().sub(this.sceneCamera.position).length();
			// console.log("Raycast distance", 
			// lastCPURaycastLocation.clone().sub(this.sceneCamera.position).length());
			console.log("AAA", gpu, cpu, "absolute delta", gpu - cpu, "relative delta", (gpu - cpu) / Math.max(gpu, cpu), "COMPARE", this.gpuRaycastLocation, this.cpuRaycastLocation);

		} else {

			console.log("BBB", gpu, world);

		}

	}

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}

