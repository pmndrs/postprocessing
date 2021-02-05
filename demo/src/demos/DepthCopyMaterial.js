import { ShaderMaterial, Uniform } from "three";

const depthCopyVertexShader = `varying vec2 vUv;

void main() {

	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}`;

const depthCopyFragmentShader = `#include <packing>

#if INPUT_DEPTH_PACKING == 3201

	uniform lowp sampler2D depthBuffer;

#else

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

#endif

varying vec2 vUv;

void main() {

	#if INPUT_DEPTH_PACKING == OUTPUT_DEPTH_PACKING

		gl_FragColor = texture2D(depthBuffer, vUv);

	#else

		#if INPUT_DEPTH_PACKING == 3201

			float depth = unpackRGBAToDepth(texture2D(depthBuffer, vUv));
			gl_FragColor = vec4(vec3(depth), 1.0);

		#else

			float depth = texture2D(depthBuffer, vUv).r;
			gl_FragColor = packDepthToRGBA(depth);

		#endif

	#endif

}`;

export class DepthCopyMaterial extends ShaderMaterial {

	constructor() {

		super({
			type: "DepthCopyMaterial",

			defines: {
				INPUT_DEPTH_PACKING: "0",
				OUTPUT_DEPTH_PACKING: "0"
			},

			uniforms: {
				depthBuffer: new Uniform(null)
			},

			fragmentShader: depthCopyFragmentShader,
			vertexShader: depthCopyVertexShader,

			toneMapped: false,
			depthWrite: false,
			depthTest: false
		});

	}

	get inputDepthPacking() {

		return Number(this.defines.INPUT_DEPTH_PACKING);

	}

	set inputDepthPacking(value) {

		this.defines.INPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	get outputDepthPacking() {

		return Number(this.defines.OUTPUT_DEPTH_PACKING);

	}

	set outputDepthPacking(value) {

		this.defines.OUTPUT_DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

}
