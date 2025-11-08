#ifdef COLOR_WRITE

	#include <common>
	#include <dithering_pars_fragment>

	#ifdef FRAMEBUFFER_PRECISION_HIGH

		uniform mediump sampler2D inputBuffer;

	#else

		uniform lowp sampler2D inputBuffer;

	#endif

#endif

#ifdef DEPTH_WRITE

	#include <packing>

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		#if DEPTH_PACKING == 3201

			return unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			return texture2D(depthBuffer, uv).r;

		#endif

	}

#endif

#ifdef USE_WEIGHTS

	uniform vec4 channelWeights;

#endif

uniform float opacity;

varying vec2 vUv;

void main() {

	#ifdef COLOR_WRITE

		vec4 texel = texture2D(inputBuffer, vUv);

		#ifdef USE_WEIGHTS

			texel *= channelWeights;

		#endif

		gl_FragColor = opacity * texel;

		#ifdef COLOR_SPACE_CONVERSION

			#include <colorspace_fragment>

		#endif

		#include <dithering_fragment>

	#else

		gl_FragColor = vec4(0.0);

	#endif

	#ifdef DEPTH_WRITE

		gl_FragDepth = readDepth(vUv);

	#endif

}
