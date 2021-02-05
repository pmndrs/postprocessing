import {
	BasicDepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Pass } from "../../../src/passes/Pass";
import { DepthCopyMaterial } from "./DepthCopyMaterial";

export class DepthSavePass extends Pass {

	constructor(depthPacking = BasicDepthPacking) {

		super("DepthSavePass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: depthPacking === BasicDepthPacking ? FloatType : UnsignedByteType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthSavePass.Target";

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

	}

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}
