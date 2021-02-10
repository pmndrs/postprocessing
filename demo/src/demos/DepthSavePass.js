import {
	RGBADepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget,
	Vector2,
	Vector4,
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

function viewZToPerspectiveDepth(viewZ, near, far) {

	return ((near + viewZ) * far) / ((far - near) * viewZ);

}

function perspectiveDepthToViewZ(invClipZ, near, far) {

	return (near * far) / ((far - near) * invClipZ - far);

}

export class DepthSavePass extends Pass {

	constructor(parentScene, camera, depthPacking = RGBADepthPacking) {

		super("DepthSavePass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;
		this.sceneCamera = camera;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: depthPacking === RGBADepthPacking ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthSavePass.Target";
		this.parentScene = parentScene;

		this.boundMousemoveCB = this.mousemoveCB.bind(this);
		document.documentElement.addEventListener("mousemove", this.boundMousemoveCB);

		this.x = 0;
		this.y = 0;
		this.raycaster = new Raycaster();

		// window.depthSavePass = this;

	}

	dispose() {

		console.log("cleaning up event listeners DepthSavePass");
		document.documentElement.removeEventListener("mousemove", this.boundMousemoveCB);

	}

	mousemoveCB(ev) {

		this.x = ev.clientX;
		this.y = ev.clientY;

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

		const mouse = new Vector2((this.x / window.innerWidth) * 2 - 1, -(this.y / window.innerHeight) * 2 + 1);
		this.raycaster.setFromCamera(mouse, this.sceneCamera);
		const intersects = this.raycaster.intersectObjects(this.parentScene.children, true);
		let lastCPURaycastLocation;
		if(intersects.length) {

			lastCPURaycastLocation = intersects[0].point;
			// console.debug("raycast under mouse", lastCPURaycastLocation);

		}

		const cpuRaycastLocation = lastCPURaycastLocation;

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

		const gpuRaycastLocation = world;

		const gpu = world.clone().sub(this.sceneCamera.position).length();

		if(lastCPURaycastLocation) {

			const cpu = lastCPURaycastLocation.clone().sub(this.sceneCamera.position).length();
			// console.log("Raycast distance", 
			// lastCPURaycastLocation.clone().sub(this.sceneCamera.position).length());
			console.debug("AAA", gpu, cpu, "absolute delta", gpu - cpu, "relative delta", (gpu - cpu) / Math.max(gpu, cpu), "COMPARE", gpuRaycastLocation, cpuRaycastLocation);

		} else {

			console.debug("BBB", gpu, world);

		}

	}

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}

