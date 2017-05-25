uniform sampler2D tDepth;

varying vec2 vUv;

#ifndef USE_LOGDEPTHBUF

	#include <packing>

	uniform float cameraNear;
	uniform float cameraFar;

	float readDepth(sampler2D depthSampler, vec2 coord) {

		float fragCoordZ = texture2D(depthSampler, coord).x;
		float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);

		return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);

	}

#endif

void main() {

	#ifdef USE_LOGDEPTHBUF

		float depth = texture2D(tDepth, vUv).x;

	#else

		float depth = readDepth(tDepth, vUv);

	#endif

	gl_FragColor = vec4(depth, depth, depth, 1.0);

}
