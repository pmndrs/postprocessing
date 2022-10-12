#include <packing>

varying vec2 vUv;

#ifdef NORMAL_DEPTH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D normalDepthBuffer;

	#else

		uniform mediump sampler2D normalDepthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		return texture2D(normalDepthBuffer, uv).a;

	}

#else

	#if INPUT_DEPTH_PACKING == 3201

		uniform lowp sampler2D depthBuffer;

	#elif defined(GL_FRAGMENT_PRECISION_HIGH)

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		#if INPUT_DEPTH_PACKING == 3201

			return unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			return texture2D(depthBuffer, uv).r;

		#endif

	}

#endif

void main() {

	#if INPUT_DEPTH_PACKING == OUTPUT_DEPTH_PACKING

		gl_FragColor = texture2D(depthBuffer, vUv);

	#else

		float depth = readDepth(vUv);

		#if OUTPUT_DEPTH_PACKING == 3201

			gl_FragColor = (depth == 1.0) ? vec4(1.0) : packDepthToRGBA(depth);

		#else

			gl_FragColor = vec4(vec3(depth), 1.0);

		#endif

	#endif

}
