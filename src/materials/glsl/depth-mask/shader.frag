#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer0;
	uniform highp sampler2D depthBuffer1;

#else

	uniform mediump sampler2D depthBuffer0;
	uniform mediump sampler2D depthBuffer1;

#endif

uniform sampler2D inputBuffer;

varying vec2 vUv;

void main() {

	#if DEPTH_PACKING_0 == 3201

		float d0 = unpackRGBAToDepth(texture2D(depthBuffer0, vUv));

	#else

		float d0 = texture2D(depthBuffer0, vUv).r;

	#endif

	#if DEPTH_PACKING_1 == 3201

		float d1 = unpackRGBAToDepth(texture2D(depthBuffer1, vUv));

	#else

		float d1 = texture2D(depthBuffer1, vUv).r;

	#endif

	if(d0 < d1) {

		discard;

	}

	gl_FragColor = texture2D(inputBuffer, vUv);

}
