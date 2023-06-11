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
uniform vec2 cameraNearFar;

float getViewZ(const in float depth) {

	#ifdef PERSPECTIVE_CAMERA

		return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

	#else

		return orthographicDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);

	#endif

}

varying vec2 vUv;

void main() {

	vec2 depth;

	#if DEPTH_PACKING_0 == 3201

		depth.x = unpackRGBAToDepth(texture2D(depthBuffer0, vUv));

	#else

		depth.x = texture2D(depthBuffer0, vUv).r;

		#ifdef LOG_DEPTH

			float d = pow(2.0, depth.x * log2(cameraNearFar.y + 1.0)) - 1.0;
			float a = cameraNearFar.y / (cameraNearFar.y - cameraNearFar.x);
			float b = cameraNearFar.y * cameraNearFar.x / (cameraNearFar.x - cameraNearFar.y);
			depth.x = a + b / d;

		#endif

	#endif

	#if DEPTH_PACKING_1 == 3201

		depth.y = unpackRGBAToDepth(texture2D(depthBuffer1, vUv));

	#else

		depth.y = texture2D(depthBuffer1, vUv).r;

		#ifdef LOG_DEPTH

			float d = pow(2.0, depth.y * log2(cameraNearFar.y + 1.0)) - 1.0;
			float a = cameraNearFar.y / (cameraNearFar.y - cameraNearFar.x);
			float b = cameraNearFar.y * cameraNearFar.x / (cameraNearFar.x - cameraNearFar.y);
			depth.y = a + b / d;

		#endif

	#endif

	bool isMaxDepth = (depth.x == 1.0);

	#ifdef PERSPECTIVE_CAMERA

		// Linearize.
		depth.x = viewZToOrthographicDepth(getViewZ(depth.x), cameraNearFar.x, cameraNearFar.y);
		depth.y = viewZToOrthographicDepth(getViewZ(depth.y), cameraNearFar.x, cameraNearFar.y);

	#endif

	#if DEPTH_TEST_STRATEGY == 0

		// Decide based on depth test.
		bool keep = depthTest(depth.x, depth.y);

	#elif DEPTH_TEST_STRATEGY == 1

		// Always keep max depth.
		bool keep = isMaxDepth || depthTest(depth.x, depth.y);

	#else

		// Always discard max depth.
		bool keep = !isMaxDepth && depthTest(depth.x, depth.y);

	#endif

	if(keep) {

		gl_FragColor = texture2D(inputBuffer, vUv);

	} else {

		discard;

	}

}
