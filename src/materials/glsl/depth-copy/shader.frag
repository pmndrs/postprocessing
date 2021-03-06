#include <packing>

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

}
