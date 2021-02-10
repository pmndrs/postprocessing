import { ShaderMaterial, Uniform, Vector2 } from "three";

const depthPickVertexShader = `
void main() {

	gl_Position = vec4(position.xy, 1.0, 1.0);

}`;

const depthPickFragmentShader = `#include <packing>

#if INPUT_DEPTH_PACKING == 3201

	uniform lowp sampler2D depthBuffer;

#else

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

#endif

uniform vec2 vUv;

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

export class DepthPickMaterial extends ShaderMaterial {

	constructor() {

		super({
			type: "DepthPickMaterial",

			defines: {
				INPUT_DEPTH_PACKING: "0",
				OUTPUT_DEPTH_PACKING: "0"
			},

			uniforms: {
				depthBuffer: new Uniform(null),
				vUv: new Uniform(new Vector2())
			},

			fragmentShader: depthPickFragmentShader,
			vertexShader: depthPickVertexShader,

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

	set position(value) {

		this.uniforms.vUv.value = value;

	}

}

