import {
	RGBADepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget
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

	return v[0] * UnpackFactorsX + v[1] * UnpackFactorsY + v[2] * UnpackFactorsZ + v[3];

}

function viewZToPerspectiveDepth(viewZ, near, far) {

	return ((near + viewZ) * far) / ((far - near) * viewZ);

}

function perspectiveDepthToViewZ(invClipZ, near, far) {

	return (near * far) / ((far - near) * invClipZ - far);

}

export class DepthSavePass extends Pass {

	constructor(camera, depthPacking = RGBADepthPacking) {

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


		this.near = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] - 1.0);
		this.far = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] + 1.0);
		console.log("nearfar", this.near, this.far);

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
		renderer.readRenderTargetPixels(this.renderTarget, 0, 0, 1, 1, pixelBuffer);

		// https://stackoverflow.com/a/56439173
		console.log('GPU depth!', -perspectiveDepthToViewZ(unpackRGBAToDepth(pixelBuffer) / 255, this.near, this.far));

	}

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}
